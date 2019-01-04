// https://tools.ietf.org/html/rfc1950
import LogLifecyle from 'react-log-lifecycle';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Binary, SimpleBinary } from './binary'
import { Static } from './static';
import { Dynamic } from './dynamic'

class Stream {
  constructor(view) {}
}

// convert bytes into
const binaryBuffer = bytes => {
  // so we'll do this in a kind of lame way. First converting it to a string binary,
  // then byte reversing it.
  const typedArray = new Uint8Array(
    bytes.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)),
  );
  let n = 0
  let current = 0
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
    index: () => {
      return (n * 8) + current
    },
    stream: num => {
      let val = []
      for (let i = 0; i < num; i++) {
        val.push(bit());
      }
      return val
    },

    next: num => {
      let val = 0;
      for (let i = 0; i < num; i++) {
        val |= bit() << i;
        // val = (val << 1) | bit()
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
class Deflate extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let { of } = this.props;
    const fBit = of.next(1);
    const type = of.next(2);
    let out = null;
    if (type === 1) {
      out = <Static of={of} />;
    } else if (type === 2) {
      out = <Dynamic stream={of} />;
    }
    return (
      <div>{`
      Deflate is a real treat. Compressed data exists in blocks. These blocks
      are arbitrary sizes (except for when they can't be compressed in which
      case they're maximum 56,535 byes).
    `}
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
}
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
