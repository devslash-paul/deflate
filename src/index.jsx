// https://tools.ietf.org/html/rfc1950
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import huffman from './huffman';

const inlineStyle = {
  fontFamily: 'monospace',
  padding: '4px',
  textAlign: 'center',
  display: 'inline-block',
  background: '#ffd894',
  margin: '0 5px',
};

const blockStyle = {
  fontFamily: 'monospace',
  border: '1px black solid',
  padding: '5px',
  textAlign: 'center',
  borderRadius: '3px',
};

// convert bytes into
const binaryBuffer = bytes => {
  // so we'll do this in a kind of lame way. First converting it to a string binary,
  // then byte reversing it.
  const typedArray = new Uint8Array(
    bytes.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)),
  );
  let current = 0;
  let n = 0;
  const bit = () => {
    // get the front bit. If it's not finished, then pop from the right. shift right.
    const val = typedArray[n];
    const ret = (val >> current) & 0x1;
    typedArray[n] = val;
    current++;
    if (current === 8) {
      n++;
      current = 0;
    }
    return ret;
  };
  return {
    next: num => {
      let val = 0;
      for (let i = 0; i < num; i++) {
        val |= bit() << i;
      }
      return val;
    },
    // data is stored packed from 76543210, but stored LSB first.
    // and data is retrieved straight out
    nextHuff: num => {
      let val = 0;
      // read a bit, move it to the left for every one you read
      for (let i = 0; i < num; i++) {
        val <<= 1;
        val |= bit();
      }
      return val;
    },
    // gets in the form with huffman in a nice format.
    // data is not
    get: () => {
      // just do what bit does
      let result = '';
      for (let i = 0; i < typedArray.length; i++) {
        let getCurrent = 0;
        for (let getBit = 0; getBit < 8; getBit++) {
          const int = (typedArray[i] >> getBit) & 0x1;
          getCurrent |= int << (7 - getBit);
        }
        result += `${getCurrent.toString(2).padStart(8, '0')} `;
      }
      return result;
    },
  };
};

const HexToBinary = hex => {
  const chars = hex.split('');
  let value = '';
  for (let i = 0; i < chars.length / 2; i++) {
    const conv = chars[i * 2] + chars[i * 2 + 1];
    let x = parseInt(conv, 16).toString(2);
    x = x.padStart(8, '0');
    value += x;
  }
  return value;
};

const SimpleBinary = ({
  of, st, inline = false, pad = 8,
}) => {
  // let slice = of.substr()
  const style = inline ? inlineStyle : blockStyle;
  if (of != null) {
    let result = of.toString(2).padStart(pad, '0');
    if (typeof of === 'object') {
      let x = '';
      of.forEach(element => {
        x += `${element.toString(2).padStart(pad, '0')} `;
      });
      result = x;
    }
    return <div style={style}>{result}</div>;
  }
  return <div style={style}>{st}</div>;
};

const Binary = ({
  of,
  start = 0,
  end,
  pad = 8,
  inline = false,
  reverse = false,
}) => {
  const bin = HexToBinary(of);
  let slice = bin.slice(start, end);
  // we want to break this at the byte level
  let result = '';
  while (slice.length > 0) {
    let x = slice.substring(0, pad);
    if (reverse) {
      x = x
        .split('')
        .reverse()
        .join('');
    }
    slice = slice.substring(pad);
    result += `${x} `;
  }
  const style = inline ? inlineStyle : blockStyle;
  return <div style={style}>{result}</div>;
};

class Index extends Component {
  constructor(props) {
    super(props);

    this.changeSet = this.changeSet.bind(this);
    this.onChange = this.onChange.bind(this);
    this.state = {
      // val: "789ccb48cdc9c95728cf2fca4901001a0b045d"
      stream:
        '789ccb48cd0182fc7c85928cd4a2541d854c85c45c854485e292a2d4c45c3d050fa074be2200fca60cc7',
      a: '789c5553490edb300cfc0a1f60f80f45d15b37a0e80318897158687128d1e8f33b929da63d3956c4e16cfe5c4d32e9de3c53aca91a35edc459fa42a19626a14b77238eba6b0b5a3692a47da51f12a9d5c8491a250ede4836e9943080df5aba58f4bc9077bae94d0a5e084000214fdd34485be9fb839ba48481430f31632ada940e49147d3c1f1a3c3105b7e6b8ff21e9d33963714a1ab47bd442a51692a2999e0ef02679175be9ab270c9e6fd4b5048d5e3a550b0a76c427d24a5fd80d63356aa534cc58e801b626061f40be9ffc78a1bb5896d2a1638760317ea97df3c2d1ffe752840b45dda0ab81e25c03d4ac00ce3b80ab153659e95357004c0fc1673872895fc8bc1bb64e7658b1501ef21bfdf2d6eb4a1f8d1bedd57ad78efc2edcccadf120f4c259e967278dffdc6484b4101622e8a89736b6e06f41af58c6559286ddd3e4834d47e2bf49eef719848d185eae8f440e482fdc713949bdfec8f0d0379d12263dd0e1103c379804129b83cf5592e9d4e169f7ced8dd785729b34e6f01e7212cafede495d034ab7f7d177fc577373457d370f3ecd26c31f62fb0f506400c17bd3ddeca678e474dde7746ddbf8dde5cb221ab3e5d689f026f030c89f2c81851230b368800339c5618d7168cb430bf23d338d21801a1207f005f1a49c2',
      b: '789ccb48cdc9c95728cf2fca4901001a0b045d',

      current: true,
    };
  }

  onChange(e) {
    this.setState(({
      stream: e.target.value,
    }));
  }

  changeSet() {
    this.setState(state => ({
      stream: state.current ? state.a : state.b,
      current: !state.current,
    }));
  }

  render() {
    const { stream } = this.state;
    return (
      <div>
        <h2>How zlib/deflate works</h2>
        Please enter input as hex stream.
        <input type="text" value={stream} onChange={this.onChange} />
        <button type="button" onClick={this.changeSet}>
          Switch
        </button>
        <h4>Binary</h4>
        <Binary of={stream} />
        Cool, here's our zlib stream.
        <ZLibHeader of={stream} />
        From here, we're now in the DEFLATE stream.
        <Deflate of={binaryBuffer(stream.substr(4))} />
      </div>
    );
  }
}

const Deflate = ({ of }) => {
  const fBit = of.next(1);
  const type = of.next(2);
  let out = null;
  if (type === 1) {
    out = <Static of={of} />;
  } else if (type === 2) {
    out = <Dynamic of={of} />;
  }
  return (
    <div>
      Deflate is a real treat. Compressed data exists in blocks. These blocks
      are arbitrary sizes (except for when they can't be compressed in which
      case they're maximum 56,535 byes).
      <p>
        Just a quick note on the bit stream. Attention must be paid to how you
        pack the bits into bytes, as DEFLATE is concerned with bits that don't
        exactly pack into a single byte, so one cannot consider a byte in its
        entirety.
      </p>
      <p>The rules are as follows</p>
      <ul>
        <li>Consider a byte kind of like a bus, it fills up from the back.</li>
        <li>
          Elements that
          <b>Aren't</b>
          {' '}
the compressed huffman code are placed into the byte LSB
          to MSB
        </li>
        <li>Huffman codes are packed MSB first</li>
      </ul>
      <p>I Have NFI why.</p>
      <p>
        At the start of each block is not just _one_, but _two_ huffman trees.
      </p>
      <p>
        If that wasn't baller enough, those trees are encoded in huffman
        encoding already. What legends.
      </p>
      <p>
        The compressed data consists of a series of elements of type types.
        <ul>
          <li>
            Literal bytes - when there are no detectable duplicate strings
            within the previous 32K input bytes
          </li>
          <li>
            pointers to duplicated strings, by a length and backward distance.
          </li>
          <ul>
            <li>These pointers can have a max length of 258</li>
            <li>And a max length of 32K bytes</li>
          </ul>
        </ul>
        Each type of value is represented in Huffman code.
      </p>
      <p>
        One tree represents literals, and lengths. One tree represents
        distances.
      </p>
      <p>
        In each block, it starts with a small piece of code to outline the trees
        for each block.
      </p>
      <p>
        Lets start looking at our stream.
        <SimpleBinary st={of.get()} />
        <p>
          Because we're in the deflate algorithm now, it's hardly surprising
          that the first part of this is some block headers.
        </p>
        <p>
          We start with out final bit header. This is set to 1 if it is the
          last, 0 otherwise.
          <SimpleBinary of={fBit} pad={1} />
        </p>
        <p>
          The next two bytes (
          <SimpleBinary of={type} pad={2} inline reverse />
) represent the
          {' '}
          <pre>BTYPE</pre>
. Specifying how this data has been compressed. The
          values correspond to
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
  );
};

const textToToken = (binary, value) => ({
  type: 'LITERAL',
  code: binary,
  value,
});

const getLengthBase = code => [
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  13,
  15,
  17,
  19,
  23,
  27,
  31,
  35,
  43,
  51,
  59,
  67,
  83,
  99,
  115,
  131,
  163,
  195,
  227,
  258,
][code - 257];

const getExtraForLength = code => [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
][code - 257];

const getDistanceBase = code => [
  1,
  2,
  3,
  4,
  5,
  7,
  9,
  13,
  17,
  25,
  33,
  49,
  65,
  97,
  129,
  193,
  257,
  385,
  513,
  769,
  1025,
  1537,
  2049,
  3073,
  4097,
  6145,
  8193,
  12289,
  16385,
  24577,
][code];

const getDistanceExtra = code => [
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
][code];

const Static = ({ of }) => {
  // we're in the static set, lets create an explanation
  let current = '';
  const read = [];
  let tries = 0;
  const codes = huffman.staticTable;

  // sanity checked limit. Expect to bail before then
  let lastCode = -1;
  while (tries < of.get().length) {
    if (lastCode > 256) {
      // then we've got extra data to read
      const extraLength = getExtraForLength(lastCode);
      let baseLength = getLengthBase(lastCode);

      // current at this point, is the code saying to go back.
      // keep it that way.
      // the extra length comes from the base length plus the
      // huffman
      if (extraLength > 0) {
        const neededExtra = of.nextHuff(extraLength);
        baseLength += neededExtra;
      }
      // read the next part
      read.push({
        type: 'LENGTH',
        code: current.toString(2).padStart(4, '0'),
        value: baseLength,
      });

      current = of.nextHuff(5);
      let distanceBase = getDistanceBase(current);
      const distExtra = getDistanceExtra(current);

      if (distExtra > 0) {
        const extra = of.nextHuff(distExtra);
        distanceBase += extra;
      }

      read.push({
        type: 'DISTANCE',
        code: current.toString(2).padStart(9, '0'),
        value: distanceBase,
      });
      lastCode = -1;
    }

    tries++;
    current = of
      .nextHuff(7)
      .toString(2)
      .padStart(7, '0');
    if (codes.includes(current)) {
      lastCode = codes.indexOf(current);
      if (lastCode === 256) {
        read.push({
          type: 'END',
          code: current,
          value: 256,
        });
        break;
      } else if (lastCode < 256) {
        read.push(textToToken(current, lastCode));
      }
      continue;
    }
    current += of.nextHuff(1).toString(2);
    if (codes.includes(current)) {
      lastCode = codes.indexOf(current);
      if (lastCode > 256) {
        continue;
      }
      read.push(textToToken(current, lastCode));
      continue;
    }
    current += of.nextHuff(1).toString(2);
    if (codes.includes(current)) {
      lastCode = codes.indexOf(current);
      read.push(textToToken(current, lastCode));
      continue;
    }
  }
  const tab = read.map(row => {
    if (row.type && row.type === 'LENGTH') {
      return (
        <tr>
          <td>Length</td>
          <td>{row.code}</td>
          <td>
            Read length:
            {row.value}
          </td>
        </tr>
      );
    }
    if (row.type && row.type === 'DISTANCE') {
      return (
        <tr>
          <td>Distance Back</td>
          <td>{row.code}</td>
          <td>
            Back:
            {row.value}
          </td>
        </tr>
      );
    }
    if (row.type && row.type === 'LITERAL') {
      return (
        <tr>
          <td>{row.value}</td>
          <td>{codes[row.value]}</td>
          <td>{row === 256 ? 'END STREAM' : String.fromCharCode(row.value)}</td>
        </tr>
      );
    }
    return null;
  });

  return (
    <div>
      In static, we're using standardised codes. Lets have a look at them
      <table>
        <tr>
          <th>Decoded value</th>
          <th>Encoded binary</th>
          <th>UTF-8 value</th>
        </tr>
        {tab}
      </table>
      <TokenSet tokens={read} />
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
        00000000. That's a special one that means end of block 00011010 00001011
        00000100 01011101 is the checksum. Which is ADLER32. This matches the
        checksum of the data that we've decompressed
      </p>
    </div>
  );
};

const Literal = ({ code, value }) => (
  <div className="tooltip">
    <div className="tooltiptext">
      encoded as:
      {code}
    </div>
    {String.fromCharCode(value)}
  </div>
);

const BaseLength = ({
  dist, of,
}) => (
  <div className="tooltip backref">
    <div className="tooltiptext">{dist}</div>
    {of}
  </div>
);

const TokenSet = ({ tokens }) => {
  let length = null;
  let current = '';
  let extensions = 0;
  const literals = tokens.map(x => {
    switch (x.type) {
      case 'LITERAL': {
        current += String.fromCharCode(x.value);
        return <Literal {...x} />;
      }
      case 'DISTANCE': {
        const len = length.value;
        const di = x.value + extensions;
        // the length can be longer than the back ref. SO
        // a way to do is it to build up the new string bit by bit and
        // just select the next one. We start at distnace back
        const start = current.length;
        let added = `${current}`;
        extensions += len;
        for (let i = current.length - di; i < start - di + len; i++) {
          // then we copy what is at i to the stream
          added += added.charAt(i);
        }
        current = added;
        return <BaseLength of={added.substr(start)} dist={di} />;
      }
      case 'LENGTH': {
        length = x;
        return null;
      }
      case 'END': {
        return null;
      }
      default:
        throw new Error(`Unexpected Token: ${x.type}`);
    }
  });
  return (
    <div className="tokenset">
      <div>{literals}</div>
    </div>
  );
};

const Dynamic = ({ of }) => {
  const hlit = of.next(5);
  return (
    <div>
      <p>
      So this is a dynamic block. To read this we have to first read the huffman
      tables. In a compressed block data is compressed in either
        <ul>
          <li>A literal byte, when the value is between 0, and 255</li>
          <li>
          A length,backwards pair where the length is from 3..258) and distance
          is between 0..32,768.
          </li>
        </ul>
      </p>
      <p>
      The first 5 bits, are HLIT. The number of literal / length codes.
        {hlit}
        {' '}
we add 257 to
      this value to get what we're after
      </p>
      <p>
      The next 5 bits are the number of distance codes
        {/* <Binary of={of} start={start + 5} end={start + 5 + 5} reverse /> */}
      Again. Reverse this and it becomes 10010 = 18
      </p>
      <p>
      The last header is the HCLEN which is the number of code lengths, minus 4.
        { /* <Binary of={of} start={start + 5 + 5} end={start + 5 + 5 + 4} reverse /> */}
      The HCLEN is 8
      </p>
      <p>
      The next part works with HCLEN (example 8) * 3 bits.
        { /* (<Binary of={of} start={start + 14} end={start + 14 + 24} reverse /> */}
      </p>
      <p>
      So this is giving us the lengths of the alphabets for code lenghts. This
      is working with the alphabet: 16, 17, 18,0, 8, 7, 9, 6, 10, 5, 11, 4, 12,
      3, 13, 2, 14, 1, 15.
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
      Now, HLIT + 275 code lengths for the literal/length alphabet. Encoded
      using the code length huffman.
      </p>
    </div>
  );
};

const ZLibHeader = ({ of }) => (
  <div>
    <h4>The ZLib Stream</h4>
A block is the last block if the 0th byte is 1.
    Remember that for the a byte, the LSB is considered the 0th bit. The start
    of a block has the following format
    <code>
      <pre>
        {`
           0   1
         +---+---+
         |CMF|FLG|
         +---+---+
      `}
      </pre>
    </code>
    <code>CMF</code>
    {' '}
stands for "Compression method and flags". It's divided
    into two sections, 4 bits each.
    <ul>
      <li>bits 0 to 3 are the compression method (CM)</li>
      <li>bits 4 to 7 are the compression info (CINFO)</li>
    </ul>
    <Binary of={of} start={4} end={8} />
    The compression method is pretty simple, and _almost_ always you'll see the
    value 8 here. In fact if that's not happened, this page won't work properly.
    The compression info is also relatively simple in the most case. I'm
    expecting you'll see
    {' '}
    <code>0111</code>
    {' '}
here.
    <pre>
      {`CINFO (Compression info)
      For CM = 8, CINFO is the base-2 logarithm of the LZ77 window
      size, minus eight (CINFO=7 indicates a 32K window size). Values
      of CINFO above 7 are not allowed in this version of the
      specification.  CINFO is not defined in this specification for
      CM not equal to 8.`}
    </pre>
    In laymans terms, the CINFO is specifying the window size of the compression
    that's taking place. LZ77 has a sliding window which it can use to
    backreference data that was there before. \MAKE BETTER Next up, we have the
    second byte. This defines the flags. It's divided as follows
    <ul>
      <li>bits 0 to 4 are FCHECK (check bits for CMF and FLG)</li>
      <li>bit 5 is FDICT (a preset dictionary existing)</li>
      <li>bits 6 and 7 are FLEVEL (compression level)</li>
    </ul>
    <span>FCHECK</span>
    {' '}
is a checksum, such that when we view CMF and FLG Lets
    ensure that this is the case:
    <Binary of={of} start={0} end={16} />
    This is equal to
    {' '}
    <Decimal of={of} start={0} end={4} />
. That number should
    be divisible by 31. If it's not, this stream is invalid. /TODO: FDICT
    <div>
      FLEVEL is the compression level, the following compression levels are for
      when CM = 8.
      <ul>
        <li>0 - fastest alogirithm</li>
        <li>1 - fast alogirithm</li>
        <li>2 - default alogirithm</li>
        <li>3 - max compression/slowest alogirithm</li>
      </ul>
      This stream we're using has the value
      {' '}
      <Binary of={of} start={8} end={10} inline />
    </div>
  </div>
);

const Decimal = ({ of, start, end }) => {
  const chars = of.slice(start, end);
  const res = parseInt(chars, 16);
  return <div>{res}</div>;
};

function onReady() {
  ReactDOM.render(<Index />, document.getElementById('hi'));
}

document.addEventListener('DOMContentLoaded', onReady);
