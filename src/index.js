// https://tools.ietf.org/html/rfc1950
import React, { Component } from "react";
import ReactDOM from "react-dom";

const inlineStyle = {
  "fontFamily": "monospace",
  "padding": '4px',
  'textAlign': 'center',
  'display': 'inline-block',
  'background': '#ffd894',
  'margin': '0 5px',
}

const blockStyle = {
  "width": "22%",
  "fontFamily": "monospace",
  "border": "1px black solid",
  "padding": "5px",
  "textAlign": "center",
  "borderRadius": "3px",
}

const HexToBinary = (hex, reverse) => {
  const chars = hex.split('')
  console.log(hex)
  var value = ""
  for(var i = 0; i < chars.length / 2; i++) {
    let conv = chars[i * 2] + chars[i * 2 + 1]
    var x = parseInt(conv, 16).toString(2)
    x = x.padStart(8, '0')
    value += x
  }
  console.log(value)
  return value
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
      <Deflate of={this.state.val.substr(4)}/>

    </div>)
  }
}

const Deflate = ({of}) => {
  return <div>
    Deflate is a real treat. Compressed data exists in blocks. These blocks are
    arbitrary sizes (except for when they can't be compressed in which case they're 
    maximum 56,535 byes). 
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
      <Binary of={of} start={0} reverse={true}/>
      <p>
        Because we're in the deflate algorithm now, it's hardly surprising that the first part of this is some
        block headers. 
      </p>
      <p> 
        <Binary of={of} start={0} end={1} inline={true} /> This is our "Final bit" header. If set to true, this
        is the last block of the DEFLATE stream. 
      </p>
      <p>
        The next two bytes (<Binary of={of} start={1} end={3} inline={true} reverse={true}/>) represent the <pre>BTYPE</pre>. Specifying how 
        this data has been compressed. The values correspond to
        <ul>
          <li>00 - no compression</li>
          <li>01 - compression with fixed huffman codes</li>
          <li>10 - compressed with dynamic huffman codes</li>
          <li>11 - reserved, thus error. Lets hope you're not seeing it</li>
        </ul>

        <Static of={of} />
         {
           // <Dynamic of={of} start={3}/> 
         }

      </p>
    </p>
  </div>
}

const Static = ({of, start}) => {
  return <div>
    In static, we're using standardised codes. Lets have a look at them

    <pre>
    {`
    Lit Value    Bits        Codes
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
      So, we now need to grab the next. 
      <p>
        10011000. This means we're in the 8 bit section. Specifically, we're talking about 
        the literal value 104. This is 'h' in ascii.
      </p>
      <p>
        10010101. This is 101 - e
      </p>
      <p>
        10011100. This is 108 - l
      </p>
      <p>
        10011100. This is the same as above.
      </p>
      <p>
        10011111. This is 111 - o.
      </p>
      <p>
        01010000. This is 32 - SPACE
      </p>
      <p>
        10100111. This is 119 - w
      </p>
      <p>
        10011111. This is 111 - o
      </p>
      <p>
        10100010. This is 114 - r
      </p>
      <p>
        10011100. This is 117 - l
      </p>
      <p>
        10010100. This is 100 - d.
      </p>
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
    Therefore, for a byte

    <Binary of={of} start={0} end={8} inline={true} />
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

    <pre>
    {`
      CINFO (Compression info)
           For CM = 8, CINFO is the base-2 logarithm of the LZ77 window
           size, minus eight (CINFO=7 indicates a 32K window size). Values
           of CINFO above 7 are not allowed in this version of the
           specification.  CINFO is not defined in this specification for
           CM not equal to 8.
    `}
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