// https://tools.ietf.org/html/rfc1950
import React, { Component } from "react";
import ReactDOM from "react-dom";
import huffman from "./huffman";

const inlineStyle = {
  "fontFamily": "monospace",
  "padding": '4px',
  'textAlign': 'center',
  'display': 'inline-block',
  'background': '#ffd894',
  'margin': '0 5px',
}

const blockStyle = {
  "fontFamily": "monospace",
  "border": "1px black solid",
  "padding": "5px",
  "textAlign": "center",
  "borderRadius": "3px",
}

// convert bytes into 
const binaryBuffer = (bytes) => {
  // so we'll do this in a kind of lame way. First converting it to a string binary, then byte reversing it. 
  let typedArray = new Uint8Array(bytes.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  }))
  let current = 0
  let n = 0
  const bit = () => {
      // get the front bit. If it's not finished, then pop from the right. shift right. 
      let val = typedArray[n]
      let ret = (val >> current) & 0x1
      typedArray[n] = val
      current++
      if(current == 8) {
        n++
        current=0
      }
      return ret
    }
  return {
    next: num => {
      let val = 0
      for(var i = 0; i < num; i++) {
        val |= (bit() << i)
      }
      return val
    },
    // data is stored packed from 76543210, but stored LSB first.
    // and data is retrieved straight out
    nextHuff: num => {
      let val = 0
      // read a bit, move it to the left for every one you read
      for(var i =0 ; i < num; i++) {
        val = val << 1
        val = val | bit()
      }
      return val
    },
    // gets in the form with huffman in a nice format. 
    // data is not
    get: () => {
      // just do what bit does
      let current = 0
      let result = ""
      for(var i =0; i < typedArray.length; i++) {
        current =0
        for(var bit = 0; bit < 8; bit++) {
          var int = typedArray[i] >> bit & 1
          current |= int << 7 - bit
        }
        result += current.toString(2).padStart(8, "0") + " "
      }
      return result
    }
  }
}

const HexToBinary = (hex) => {
  const chars = hex.split('')
  var value = ""
  for(var i = 0; i < chars.length / 2; i++) {
    let conv = chars[i * 2] + chars[i * 2 + 1]
    var x = parseInt(conv, 16).toString(2)
    x = x.padStart(8, '0')
    value += x
  }
  return value
}

const SimpleBinary = ({of, inline=false, pad=8, reverse=false}) => {
  // let slice = of.substr()
  let result = of.toString(2).padStart(pad, "0")
  if(typeof of == "object") {
    var x = ''
    of.forEach(element => {
      x += element.toString(2).padStart(pad, "0") + " "
    });
    result = x
  }
  let style = inline ? inlineStyle : blockStyle
  return <div style={style}>
    {result}
  </div>
}

const Binary = ({ of, start = 0, end, pad = 8, inline=false, reverse=false }) => {
  const bin = HexToBinary(of)
  let slice = bin.slice(start, end)
  // we want to break this at the byte level
  let result = ""
  while(slice.length > 0) {
    var x = slice.substring(0, pad)
    if (reverse) {
      x = x.split('').reverse().join("")
    }
    slice = slice.substring(pad)
    result += x + " "
  }
  let style = inline ? inlineStyle : blockStyle
  return <div style={style}>
    {result}
  </div>
}

class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      val: "789ccb48cdc9c95728cf2fca4901001a0b045d"
    }
  }

  render() {
    return (<div>
      <h2>How zlib/deflate works</h2>

      Please enter input as hex stream.
      <input type="text" value={this.state.val} onChange={(e) => this.setState({ val: e.target.value })}></input>

      <h4>Binary</h4>
      <Binary of={this.state.val} />

      Cool, here's our zlib stream. 
      <ZLibHeader of={this.state.val} />

      From here, we're now in the DEFLATE stream. 
      <Deflate of={binaryBuffer(this.state.val.substr(4))}/>

    </div>)
  }
}

const Deflate = ({of}) => {
  let fBit = of.next(1)
  let type = of.next(2)
  let out = null
  if(type == "01") {
    out = <Static  of={of} />
  } else if (type == "10") {
    out = <Static  of={of} />
    // out = <Dynamic of={of} />
  }
  return <div>
    Deflate is a real treat. Compressed data exists in blocks. These blocks are
    arbitrary sizes (except for when they can't be compressed in which case they're 
    maximum 56,535 byes). 
    <p>
      Just a quick note on the bit stream. Attention must be paid to how you pack the bits into bytes, as DEFLATE is concerned
      with bits that don't exactly pack into a single byte, so one cannot consider a byte in its entirety. 
    </p>
    <p>
      The rules are as follows
    </p>
    <ul>
      <li>Consider a byte kind of like a bus, it fills up from the back.</li>
      <li>Elements that <b>Aren't</b> the compressed huffman code are placed into the byte LSB to MSB</li>
      <li>Huffman codes are packed MSB first</li>
    </ul>
    <p>
      I Have NFI why. 
    </p>
    <p>
      At the start of each block is not just _one_, but _two_ huffman trees.
    </p>
    <p>
      If that wasn't baller enough, those trees are encoded in huffman encoding
      already. What legends.
    </p>
    <p>
      The compressed data consists of a series of elements of type types. 
      <ul>
        <li>Literal bytes - when there are no detectable duplicate strings within the previous 32K input bytes</li>
        <li>pointers to duplicated strings, by a length and backward distance.</li>
        <ul>
          <li>These pointers can have a max length of 258</li>
          <li>And a max length of 32K bytes</li>
        </ul>
      </ul>
      Each type of value is represented in Huffman code. 
    </p>
    <p>
      One tree represents literals, and lengths.
      One tree represents distances.
    </p>
    <p>
      In each block, it starts with a small piece of code to outline the trees for 
      each block.
    </p>
    <p>
      Lets start looking at our stream. 
      <SimpleBinary of={of.get()}/>
      <p>
        Because we're in the deflate algorithm now, it's hardly surprising that the first part of this is some
        block headers. 
      </p>
      <p> 
        We start with out final bit header. This is set to 1 if it is the last, 0 otherwise.
        <SimpleBinary of={fBit} pad={1}/>
      </p>
      <p>
        The next two bytes (<SimpleBinary of={type} pad={2} inline={true} reverse={true}/>) represent the <pre>BTYPE</pre>. Specifying how 
        this data has been compressed. The values correspond to
        <ul>
          <li>00 - no compression</li>
          <li>01 - compression with fixed huffman codes</li>
          <li>10 - compressed with dynamic huffman codes</li>
          <li>11 - reserved, thus error. Lets hope you're not seeing it</li>
        </ul>

      {out}

      </p>
    </p>
  </div>
}

const Static = ({of}) => {
  // we're in the static set, lets create an explanation
  let current = ""
  let read = []
  let tries = 0
  let codes = huffman.staticTable

  // sanity checked limit. Expect to bail before then 
  let lastCode = -1
  while(tries < of.get().length) {
    if(lastCode > 256) {
      // then we've got extra data to read
      if (lastCode == 279) {
        // then we read 5. 
        current = of.nextHuff(4)
        read.push({
          type: "LENGTH",
          code: current.toString(2).padStart(4, "0"),
          value: 279 + current
        })
        current = of.nextHuff(5)
        read.push({
          type: "DISTANCE",
          code: current.toString(2).padStart(5, "0"),
          value: 1
        })
      }
    }
    tries++
    current = of.nextHuff(7).toString(2).padStart(7, "0")
    if (codes.includes(current)) {
      lastCode = codes.indexOf(current)
      read.push(lastCode)
      // this is where the special one is
      if(codes.indexOf(current) == 256) {
        // then we're done. Break out
        break;
      }
      continue
    }
    current += of.nextHuff(1).toString(2)
    if (codes.includes(current)) {
      lastCode = codes.indexOf(current)
      read.push(lastCode)
      continue
    }
    current += of.nextHuff(1).toString(2)
    if (codes.includes(current)) {
      lastCode = codes.indexOf(current)
      read.push(lastCode)
      continue
    }
  }
  const tab = read.map(row => {
    if(row.type && row.type == "LENGTH") {
      return <tr>
        <td>Length</td>
        <td>{row.code}</td>
        <td>Read length: {row.value}</td>
      </tr>
    }
    if(row.type && row.type == "DISTANCE") {
      return <tr>
        <td>Distance Back</td>
        <td>{row.code}</td>
        <td>Back: {row.value}</td>
      </tr>
    }
    return <tr>
      <td>{row}</td>
      <td>{codes[row]}</td>
      <td>{row == 256 ? "END STREAM" : String.fromCharCode(row)}</td>
    </tr>
  })

  return <div>
    In static, we're using standardised codes. Lets have a look at them
    <table>
      <tr>
        <th>Decoded value</th>
        <th>Encoded binary</th>
        <th>UTF-8 value</th>
      </tr>
      {tab}
    </table>
    <pre>
    {`Lit Value    Bits        Codes
    ---------    ----        -----
      0 - 143     8          00110000 through
                             10111111
    144 - 255     9          110010000 through
                             111111111
    256 - 279     7          0000000 through
                             0010111
    280 - 287     8          11000000 through
                             11000111
                             `}
    </pre>
    <p>
        00000000. That's a special one that means end of block

        00011010 00001011 00000100 01011101 is the checksum. Which is ADLER32. This 
        matches the checksum of the data that we've decompressed
    </p>
  </div>
}

const Dynamic = ({ of, start }) => {
  return <div>
    <p>
      So this is a dynamic block. To read this we have to first read the huffman tables. 
      In a compressed block data is compressed in either
      <ul>
        <li>A literal byte, when the value is between 0, and 255</li>
        <li>A length,backwards pair where the length is from 3..258) and distance is between 0..32,768.</li>
      </ul>
    </p>
    <p>
      The first 5 bits, are HLIT. The number of literal / length codes. 
      <Binary of={of} start={start} end={start + 5} reverse={true}/> we add 257 to this value to get what we're after
    </p>
    <p>
      The next 5 bits are the number of distance codes
      <Binary of={of} start={start + 5} end={start + 5 + 5} reverse={true}/>
      Again. Reverse this and it becomes 10010 = 18
    </p>
    <p>
      The last header is the HCLEN which is the number of code lengths, minus 4. 
      <Binary of={of} start={start + 5 + 5} end={start + 5 + 5 + 4} reverse={true}/>
      The HCLEN is 8
    </p>
    <p>
      The next part works with HCLEN (example 8) * 3 bits. 
      <Binary of={of} start={start + 14} end={start + 14 + 24} reverse={true}/>
    </p>
      <p>
      So this is giving us the lengths of the alphabets for code lenghts. This is working with the alphabet:
      16, 17, 18,0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15.
      </p>
      <p>
        In our example, thie means that 
        <ul>
          <li>16 = 110 = 6</li>
          <li>17 = 110 = 6</li>
          <li>18 = 011 = 7</li>
          <li>0 = 100 = 1</li>
          <li>8 = 100 = 1</li>
          <li>7 = 101 = 1</li>
          <li>9 = 001 = 1</li>
          <li>9 = 001 = 1</li>
        </ul>
      </p>
      <p>
        Now, HLIT + 275 code lengths for the literal/length alphabet. Encoded using the code length huffman.
      </p>
    </div>
}

const ZLibHeader = ({ of }) => {
  return <div>
    <h4>The ZLib Stream</h4>
    A block is the last block if the 0th byte is 1. Remember that for the a byte, the LSB is considered the 0th bit.
    
    The start of a block has the following format
    <code>
      <pre>{`
           0   1
         +---+---+
         |CMF|FLG|
         +---+---+
      `}</pre>
    </code>

    <code>CMF</code> stands for "Compression method and flags". It's divided into two sections, 4 bits each.
    <ul>
      <li>bits 0 to 3 are the compression method (CM)</li>
      <li>bits 4 to 7 are the compression info (CINFO)</li>
    </ul>
    <Binary of={of} start={4} end={8}/>
    The compression method is pretty simple, and _almost_ always you'll see the value 8 here. In fact if that's not happened, this page won't work properly.

    The compression info is also relatively simple in the most case. I'm expecting you'll see <code>0111</code> here.
    <pre>{`CINFO (Compression info)
      For CM = 8, CINFO is the base-2 logarithm of the LZ77 window
      size, minus eight (CINFO=7 indicates a 32K window size). Values
      of CINFO above 7 are not allowed in this version of the
      specification.  CINFO is not defined in this specification for
      CM not equal to 8.`}
    </pre>

    In laymans terms, the CINFO is specifying the window size of the compression that's taking place. LZ77 has a sliding window which it can
    use to backreference data that was there before. \MAKE BETTER

    Next up, we have the second byte. This defines the flags. It's divided as follows

    <ul>
      <li>bits 0 to 4 are FCHECK (check bits for CMF and FLG)</li>
      <li>bit 5 is FDICT (a preset dictionary existing)</li>
      <li>bits 6 and 7 are FLEVEL (compression level)</li>
    </ul>

    <span>FCHECK</span> is a checksum, such that when we view CMF and FLG 

    Lets ensure that this is the case:
    <Binary of={of} start={0} end={16} />

    This is equal to <Decimal of={of} start={0} end={4}/>. That number should be divisible by 31.
    If it's not, this stream is invalid.
    
    /TODO: FDICT
    <div>
      FLEVEL is the compression level, the following compression levels are for when
      CM = 8. 

      <ul>
        <li>0 - fastest alogirithm</li>
        <li>1 - fast alogirithm</li>
        <li>2 - default alogirithm</li>
        <li>3 - max compression/slowest alogirithm</li>
      </ul>

      This stream we're using has the value <Binary of={of} start={8} end={10} inline={true}/>
    </div>
  </div>
}

const Decimal = ({of, start, end}) => {
  const chars = of.slice(start, end)
  const res = parseInt(chars, 16)
  return <div>
    {res}
  </div>
}

function onReady() {
  ReactDOM.render(<Index />, document.getElementById("hi"))
}

document.addEventListener('DOMContentLoaded', onReady)