import {
  Stream
} from "./stream";
import {
  getLengthBase,
  getExtraForLength,
  getDistanceBase,
  getDistanceExtra
} from './constants';

/** 
 * 
 * @param {Object.<string,number>} litLen 
 * @param {Object.<string,number>} dist 
 */
export const decode = (litLen, dist, stream) => {
  let tokens = []
  let lastToken = null
  do {
    lastToken = getNextToken(litLen, stream)
    if (lastToken.type === "BACKREF") {
      // then we must add extra tokens
      let length = getBackLengthForCode(lastToken.value, stream)
      const distToken = getNextToken(dist, stream)
      const distBack = getDistanceLengthForCode(distToken.value, stream)
      // get that token back that far
      let start = true
      while (length > 0) {
        const backToken = JSON.parse(JSON.stringify(tokens[tokens.length - distBack]))
        if(start) {
          start = false
          backToken.start = true
        }
        backToken.backRef = true
        tokens.push(backToken)
        length--
      }
    } else {
      tokens.push(lastToken)
    }
  } while (lastToken.value !== 256)

  return tokens
}

/**
 * 
 * @param {Stream} stream 
 * @param {*} huff 
 * @param {*} len 
 */
export const decode_lens = (stream, huff, len) => {
  let lens = []
  while(lens.length < len) {
    const token = getNextToken(huff, stream)
    if(token.value < 16) {
      lens.push(token.value)
    } else if (token.value == 16) {
      // copy the previous code length 3 - 6 times
      let repeat = stream.next(2) + 3
      while(repeat > 0) {
        repeat--;
        lens.push(lens[lens.length - 1])
      }
    } else if (token.value == 17) {
      // repeat 0 for 3 - 10 times
      let repeat = stream.next(3) + 3
      while (repeat > 0) {
        repeat--;
        lens.push(0)
      }
    } else if (token.value == 18) {
      // repeat 0 for 11 - 138 times
      let repeat = stream.next(7) + 11
      while(repeat > 0) {
        repeat--
        lens.push(0)
      }
    }
  }
  return lens
}

const getBackLengthForCode = (code, stream) => {
  let base = getLengthBase(code)
  let extra = getExtraForLength(code)
  let extraVal = stream.next(extra)
  return base + extraVal
}

const getDistanceLengthForCode = (code, stream) => {
  let base = getDistanceBase(code)
  let extra = getDistanceExtra(code)
  let extraVal = stream.next(extra)

  return base + extraVal
}

/**
 * 
 * @typedef {Object} result
 * @property {string} raw
 * @property {number} value
 * @property {string} char
 * @property {string} type
 */

/**
 * @param {Object.<string, number>} litLen 
 * @param {Stream} stream 
 * @returns {result}
 */
const getNextToken = (litLen, stream) => {
  let val = ""
  let sanity = 0

  while (sanity < 100) {
    sanity++
    val += stream.next(1)
    const setVal = litLen[val]

    if (setVal !== undefined) {
      let type = "LITERAL";
      if (setVal === 256) type = "END"
      if (setVal > 256) type = "BACKREF"
      return {
        raw: val,
        type: type,
        char: String.fromCharCode(litLen[val]),
        value: litLen[val]
      }
    }
  }
  throw Error("Unable to continue, sanity check reached")
}