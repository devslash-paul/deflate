import { DeflateBlock } from "./deflate_block";
import { Stream } from './stream'

export class Deflate {
  /**
   * 
   * @param {Stream} stream 
   */
  constructor(stream) {
    this.stream = stream
    this.output = {}
    // there's at least one block
    this.output.blocks = []
    let block;
    do {
      block = new DeflateBlock(stream)
      this.output.blocks.push(block.get())
    } while(!block.isLast())
  }

  get() {
    return this.output
  }
}