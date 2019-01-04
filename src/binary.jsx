import React, { Component } from 'react';

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

export const SimpleBinary = ({
  of, st, exact, inline = false, pad = 8,
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
  if (exact != null) {
    let result = '';
    for(var i =0 ; i < exact.length; i++) {
      result += exact[i]
      if ((i + 1) % 8 == 0) {
        result += " "
      }
    }
    return <div style={style}>{result}</div>;
  }
  return <div style={style}>{st}</div>;
};

export const Binary = ({
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
