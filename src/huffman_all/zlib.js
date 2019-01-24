import {
  Stream,
  val
} from './stream'
import {
  Deflate
} from './deflate'

export class Zlib {

  /**
   * @param {string} stream as hex stream
   */
  constructor(stream) {
    const typedArray = new Uint8Array(
      stream.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)),
    );
    this.stream = new Stream(typedArray);
    this.output = {
      tye: "ZLIB",
      stream: this.stream.get().replace(/ /g, ""),
      zlibHeader: {}
    }

    this.getZLibHeader(this.output.zlibHeader)
    // we're into deflate
    const compressedBlock = new Deflate(this.stream).get()
    this.output.deflate = compressedBlock
  }

  getZLibHeader(header) {
    header.processed = false
    const compressionMethod = this.stream.next(4)
    const cInfo = this.stream.next(4)
    const fCheck = this.stream.next(5)
    const fDict = this.stream.next(1)
    const fLevel = this.stream.next(2)
    const combinedFlag = (fLevel << 6) | (fDict << 5) | fCheck
    const combinedCMF = ((cInfo << 4) | compressionMethod) * 256 + combinedFlag

    header.compressionMethod = val(compressionMethod, 4)
    header.compressionInfo = val(cInfo, 4)
    header.flags = {
      fCheck: val(fCheck, 4),
      fDict: val(fDict, 1),
      fLevel: val(fLevel, 2)
    }
    header.checkHeader = val(combinedCMF, 8)
    header.processed = true
  }

  /**
   * Get the ZLIB stream as an annotated object set
   */
  get() {
    return this.output
  }
}