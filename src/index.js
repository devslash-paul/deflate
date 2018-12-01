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

const HexToBinary = (hex) => {
  const chars = hex.split()
  var value = ""
  for(var i = 0; i < chars.length; i++) {
    let conv = chars[i * 2] + chars[i * 2 + 1]
    console.log(conv)
    var x = parseInt(conv, 16).toString(2)
    console.log(x)
    x = x.padStart(8, '0')
    value += x
  }
  return value
}

const Binary = ({ of, start = 0, end, pad = 8, inline=false }) => {
  const bin = HexToBinary(of)
  let slice = bin.slice(start, end)
  // we want to break this at the byte level
  let result = ""
  while(slice.length > 0) {
    var x = slice.substring(0, pad)
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
      val: "789c8bcac94c52c848cdc9c95728c9482d4a050031f705fe"
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
      <Deflate />

    </div>)
  }
}

const Deflate = () => {
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
    remember that bit 0 is the Least significant bit of the byte, so the right most in this representation.
    <Binary of={of} start={4} end={8} pad={4} />

    The compression method is pretty simple, and _almost_ always you'll see the value 8 here. In fact if that's not happened, this page won't work properly.

    The compression info is also relatively simple in the most case. I'm expecting you'll see <code>0111</code> here.

    <div>
      CINFO (Compression info)
           For CM = 8, CINFO is the base-2 logarithm of the LZ77 window
           size, minus eight (CINFO=7 indicates a 32K window size). Values
           of CINFO above 7 are not allowed in this version of the
           specification.  CINFO is not defined in this specification for
           CM not equal to 8.
    </div>

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