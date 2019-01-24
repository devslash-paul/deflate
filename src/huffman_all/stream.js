export class Stream {
  constructor(view, n = 0, current = 0) {
    this.typedArray = new Uint8Array(view)
    this.n = n
    this.current = current
  }

  copy() {
    return new Stream(this.typedArray, this.n, this.current)
  }

  index() {
    return this.n * 8 + this.current
  }

  bit() {
    // get the front bit. If it's not finished, then pop from the right. shift right.
    const val = this.typedArray[this.n];
    const ret = (val >> this.current) & 0x1;
    this.typedArray[this.n] = val;
    this.current++;
    if (this.current === 8) {
      this.n++;
      this.current = 0;
    }
    return ret;
  };
  
  stream(num) {
    let val = []
    for (let i = 0; i < num; i++) {
      val.push(this.bit());
    }
    return val
  }

  next(num) {
    let val = 0;
    for (let i = 0; i < num; i++) {
      val |= this.bit() << i;
      // val = (val << 1) | bit()
    }
    return val;
  }
  // data is stored packed from 76543210, but stored LSB first.
  // and data is retrieved straight out
  // nextHuff(num) {
  //   let val = 0;
  //   // read a bit, move it to the left for every one you read
  //   for (let i = 0; i < num; i++) {
  //     val <<= 1;
  //     val |= this.bit();
  //   }
  //   return val;
  // }
  // gets in the form with huffman in a nice format.
  // data is not
  get() {
    // just do what bit does
    let result = '';
    for (let i = 0; i < this.typedArray.length; i++) {
      let getCurrent = 0;
      for (let getBit = 0; getBit < 8; getBit++) {
        const int = (this.typedArray[i] >> getBit) & 0x1;
        getCurrent |= int << (7 - getBit);
      }
      result += `${getCurrent.toString(2).padStart(8, '0')} `;
    }
    return result;
  }
}

export const val = (val, pad) => {
  return {
    val,
    raw: val.toString(2).padStart(pad, "0")
  }
}