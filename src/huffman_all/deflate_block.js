import {
  Stream,
  val
} from "./stream"
import {
  lenToTree,
  toHuffman
} from "./lens_to_tree";
import {
  getStaticCodeLens,
  getStaticDistanceLengths
} from './static_tree';
import {
  getLitLenAlphabet,
  getDistAlphabet
} from "./constants";
import {
  decode, decode_lens
} from "./huffman_decode";

export class DeflateBlock {

  /**
   * 
   * @param {Stream} stream 
   */
  constructor(stream) {
    this.stream = stream
    this.output = {}
    this.processed = ""
    this.output.header = this.getHeader()
    //TODO: 0, 4
    if (this.output.header.bType.val == 1) {
      const litLenCodes = lenToTree(getStaticCodeLens())
      const distCodes = lenToTree(getStaticDistanceLengths())
      const litLenHuffman = toHuffman(litLenCodes, getLitLenAlphabet())
      const distHuffman = toHuffman(distCodes, getDistAlphabet())

      this.output.tables = {
        type: "STATIC",
        codeLengths: getStaticCodeLens(),
        distLengths: getStaticDistanceLengths(),
        litLenCodes,
        distCodes,
        litLenHuffman,
        distHuffman
      }
      this.output.tokens = decode(litLenHuffman, distHuffman, stream)
    } else if (this.output.header.bType.val == 2) {
      this.output.tables = {
        type: "DYNAMIC"
      }
      const hlit = this.stream.next(5)
      const hdist = this.stream.next(5)
      const hclen = this.stream.next(4)
      const codeLenghAlphabet = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
    
      const bitTable = Array(codeLenghAlphabet.length).fill(0)
      for (var i = 0; i < hclen + 4; i++) {
        bitTable[codeLenghAlphabet[i]] = stream.next(3)
      }

      const bitTableTree = lenToTree(bitTable)
      const metaHuffman = toHuffman(bitTableTree)

      const litLenLengths = decode_lens(stream, metaHuffman, 257 + hlit)
      this.output.tables.litLenLengths = litLenLengths
      this.output.tables.litLenHuff = toHuffman(lenToTree(litLenLengths), alphTo(285))

      const backLengths = decode_lens(stream, metaHuffman, hdist + 1)
      this.output.tables.distCodes = backLengths
      this.output.tables.distCodesHuffman = toHuffman(lenToTree(backLengths), alphTo(29))

      this.output.tokens = decode(this.output.tables.litLenHuff, this.output.tables.distCodesHuffman, stream)

      this.output.tables.bitTable = bitTable
      this.output.tables.bitTableTree = bitTableTree
      this.output.tables.metaHuffman = metaHuffman
      this.output.tables.hclen = hclen
      this.output.tables.hlit = hlit
      this.output.tables.hdist = hdist + 1
    }

    this.output.stream = this.processed
  }

  report(x, y) {
    this.processed += val(x, y).raw
    return val(x, y)
  }

  getHeader() {
    const bFinal = this.stream.next(1)
    const bType = this.stream.next(2)
    return {
      bFinal: this.report(bFinal, 1),
      bType: this.report(bType, 2)
    }
  }

  isLast() {
    return true; //TODO
  }

  get() {
    return this.output;
  }

}

const alphTo = (to) => {
  let x = []
  for(var i =0; i <= to; i++) {
    x.push(i)
  }
  return x
}