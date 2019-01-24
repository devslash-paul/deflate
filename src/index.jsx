// https://tools.ietf.org/html/rfc1950
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Binary, SimpleBinary } from './binary'
import { Static } from './static';
import { Dynamic } from './dynamic'

class Stream {
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
  nextHuff(num) {
    let val = 0;
    // read a bit, move it to the left for every one you read
    for (let i = 0; i < num; i++) {
      val <<= 1;
      val |= this.bit();
    }
    return val;
  }
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

// convert bytes into
const binaryBuffer = bytes => {
  // so we'll do this in a kind of lame way. First converting it to a string binary,
  // then byte reversing it.
  const typedArray = new Uint8Array(
    bytes.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)),
  );
  return new Stream(typedArray)
}

  class Index extends Component {
    constructor(props) {
      super(props);

      this.changeSet = this.changeSet.bind(this);
      this.onChange = this.onChange.bind(this);
      this.state = {
        // val: "789ccb48cdc9c95728cf2fca4901001a0b045d"
        a:
          '789ccb48cd0182fc7c85928cd4a2541d854c85c45c854485e292a2d4c45c3d050fa074be2200fca60cc7',
        // stream: '789c5553490edb300cfc0a1f60f80f45d15b37a0e80318897158687128d1e8f33b929da63d3956c4e16cfe5c4d32e9de3c53aca91a35edc459fa42a19626a14b77238eba6b0b5a3692a47da51f12a9d5c8491a250ede4836e9943080df5aba58f4bc9077bae94d0a5e084000214fdd34485be9fb839ba48481430f31632ada940e49147d3c1f1a3c3105b7e6b8ff21e9d33963714a1ab47bd442a51692a2999e0ef02679175be9ab270c9e6fd4b5048d5e3a550b0a76c427d24a5fd80d63356aa534cc58e801b626061f40be9ffc78a1bb5896d2a1638760317ea97df3c2d1ffe752840b45dda0ab81e25c03d4ac00ce3b80ab153659e95357004c0fc1673872895fc8bc1bb64e7658b1501ef21bfdf2d6eb4a1f8d1bedd57ad78efc2edcccadf120f4c259e967278dffdc6484b4101622e8a89736b6e06f41af58c6559286ddd3e4834d47e2bf49eef719848d185eae8f440e482fdc713949bdfec8f0d0379d12263dd0e1103c379804129b83cf5592e9d4e169f7ced8dd785729b34e6f01e7212cafede495d034ab7f7d177fc577373457d370f3ecd26c31f62fb0f506400c17bd3ddeca678e474dde7746ddbf8dde5cb221ab3e5d689f026f030c89f2c81851230b368800339c5618d7168cb430bf23d338d21801a1207f005f1a49c2',
        stream: '789ced59cbaa243712dddfafd00724f503b332ee1968f0d86d06cf5e95a9aa2b93afd6a3e8cf9f132f49d9301b8317c617fad255f990224e9c8838a1fae9486173f1cc7573cbb11ec9e5589cdf4299dc7cec39cc25949a9c5fe219f31cf7a70b6b2c37f76f1fe6b0fbecf21cd69062fe5a839b6bca35bb173de26a71e7916b48e1e67eaeebea3777befb144af22ed592b0e3d7ea37dcc41dbf462c505c3912fe393f3b9880a5f8bdf94867486e3deeb81b7333d185eaf698e3cd7dde5df6cf58f8ae7d10afbc8b1bde5e6280d5bfa439ba974f114befbe1c64f409374abce30a56dcfc132bba057fa74ff03c861d578fbd843ce115784b70a4b8c4b9ae7867abf9e6fe1b5f1e1fdcea8150f4eea06db0da59135dad335c999c2f1777b0ce49e606324f21720facb0b24bf25d6252d3ee351e800c7e3f092abc887bf479ead8e0ee03f0c3a82f615d03d94d4e7eadb887059ef8bc4442fd336e3d61c67bd89784009ab5af587c0088273cd73726bdf808f519b1014c76e1f18873840f1abf999e7df9155b33889e2802f81086dd2d35322637f7e9d8c34c466aa0c9b39bfb4fcd880240cfc1c5c57998a65b6e0857c8149e95181a293a396eb7b7b71f13c857b04121e6c89e6e3f76e667c303a8bb7c2c7e0d880373dd10ce03875ff115126879228021c13a819d56ab2bf698039efe21ecc1ef641ff90f8ebbbdeef3801f28512a90fd927cc8449b2b6a12c41c16d8fa2d125df6787f87f3b862f47f246458a4c04b009834f638590633e85120ce76be8eb596932e0b5dc82ae3c5b7891dd80e8e89002df0bfc23bb1d7e3de078a1f28fe05519cdaca752c5bd3a51b7534a465fdabe2ee504e266e1ee2156252fde27b8d9d60b4dc3febfa8abb4fece5249574f3da6ab84ae2b195ca1c62d15a1d61cb765bcf9bac3b3258b4d223a40da1415ddb5a656c75fce1eb2c4d690df1014fd0657a21b43018597c9a2bdcc1020005a651692da8ff95ca6f41f7abcc925ef505b46389c7e4167871e727a981d53c48003c9b0ba2d24de5c0bfbd8d15db68698d5551615c09a68be55005b42b0217f3762c0d154908449bfadc863b873a80d438d23d0e31cac422ea3d0bb51631dea20bdeaef1497cf26e0d079cdeb9bde721795a4e105e8832388436d3b4c93ddee19924cf811d5a2236249916b5980f163b821e6136d9d1de2b719fe35277e039743df74cfe15e18ed8cbd9d5948a39b173269d6327a750dfdcaf5538ae69a0204a3c29f15a7b962510b14fccdbc8649d4c0a485510ece332c888318fc4e80137ab10ec86dc358970e0520a22413aa4a13635608cb2ffb96e354127bab00b2a359392c957fb04cb848c460d7b4a7887650823cb8da901dd4a1d6da9fbdfdc6fc5dee7746da65061257449b97174e14aa4c0d2daf7d583fce53b91f5eeef0081f52299d54b19500ba401c9b63d14939a46e80736cc24a1541236db8457cd24abde9bcf99ca7733d514efcabb481937b64e5cda99142244bb5d930ad53d6ec665290cc3daab0739486a1393f740de5049fe60d35f8a4ddabbb8e1d6f5acc517d5d664258a1c47f6e6b8053f30c3503fa039a19567d9d1069c883eb18a6ce138f4566bd5b3b70cd30332e8b8df6b2e87da1317eba4cc412bfc71f99ec2ea0a9cb27678e9e3661df64ec7d0acb8f64d54e0ad514a83db783a13c973c1bcb5325d513b9a966d1be478fc52087886b521eeed4da50fb3975386b3c1ba93a93f115e246fccae46201aa64c49919d2c37687eba74bd4138fe581311a58a44b464127cd950232c119509dafa912616b1629802b56ddd24c7c1e6252a9c4dab21e435cbea90299cce52aaba66b4f450a22bb5b872699b6a914427d5cac4ed5f621001532d3aab4a62927fb23317338990f2a75b3d2a139a551572193f7fa664d57453635860e651a7516737db38ba7e9eeb96fd7e73ff2c94138370532fd51852a366c8dbdb6f24f3108923f7784d43a2f298cbc3bbd55824c1cdfdf4478f644c8d77cd43fe4b19bbb0a7fba399a9cfa8cc6f29cc0126191ce66958b5812322c5c2d30aa9022b98b0ae19cd16ce0d433d315ce9d143af45d43a4893d53048268e6a49d9ce045ab9172a0e85e25289e59b76cca96578cb09915c60d90c78c7832e61bab429224d17d6bcc49fad05ac89b58a910ba7b49437ab18ec5d2b02d5c0e03f960172aa2255bb7554f340c74ad2c4a06297ffdcb14cced691b1c41054276312dee4fade708523c2618af2d4b27108bf1ce0d9ced406f885a9b5480ea6aa1339ecea2187eb52f4b9b071ad84099a95d3b88dbaece771ee62152099da2c332445d950a54eefc74e5d4353b26dce586a4d116524b64c433525a250f5d6f1b4d3ac616f49d4eb785cfacc49e848df1e784e35f03254e971ea98661c6ddfa58536ea568854b7d48199cdea6b113d8f02b4e277fcb6aed217e4b18efc1dc715eb7c1c1a3bdc157a4e741c403e049dc3111a1ea1b40e5e00d9e8be4eadbdc934db11c3010e2eac12ad33c54dce20db40cd9a571b0ec94e6bf97a580dc57387479ef70fff705fde7d9649ba4795acd1426162a98fe99f7724ffac0580015ca1b6bc1ec9e4625d44ce017870372dc1e964b9e5bfaff7ea7f8b25633a0ea5ab76fc962ddf6caf768cc4a870b2f48302650f1fb80bd77a291727ed8420fc3f6a700e5c7a8c885d3ed91006f461607c8cabd8b8e33018b488915cfb663381d53f693256a7db5183f8abaa407e43904a6aef8f6d8a611c3126f82e9965a4203b497588fe6847ddb6683f9a17b3ae2960872ebdf0f4e7c5384590be0bd7388e027e9b8f86df0ec085b192db78df7b742311cf2e74206067153dad64503374f46c4e2a7a9413ac69f855c580b6f94d1a4befd8d7a3235344c6ec56f81a7bf5778661286872a4cd6f22332d60833597394fcac607001f00fc5d01802fff035b41f9d3',
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
