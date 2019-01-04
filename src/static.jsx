import huffman from './huffman';
import React, { Component } from 'react';
import {
 getDistanceBase, getDistanceExtra, getExtraForLength, getLengthBase
} from './static_constants'

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
}

export const Static = ({ of }) => {
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
}

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

const textToToken = (binary, value) => ({
  type: 'LITERAL',
  code: binary,
  value,
});

