const ccode = code => [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15][code]

// Len is the HLEN
export const hlenBitTable = (stream, hlen) => {
  var ret = []
  for(var i = 0; i < hlen / 3; i++) {
    ret.push(stream.next(3))
  }
  return ret
}