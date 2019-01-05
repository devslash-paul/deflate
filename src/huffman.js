import React, { Component } from 'react';
import { Huffman } from "./huffmantree";

export const HuffmanTree = ({ alphabet, lens }) => {
  const list = createTable(lens, alphabet)
  const table = {}
  const other = {}
  for(var i = 0; i < lens.length; i++) {
    if(list[i] !== 0) {
      table[alphabet[i]] = list[i]
      other[list[i]] = alphabet[i]
    }
  }
  // go down each path until the path terminates with a value
  const tree = recurseTree(other, "", {})

  return <Huffman tree={tree} len={10}/>
}

const recurseTree = (table, prefix, output) => {
  if(prefix.length > 10) return output;
  //TODO: Change it so that if no prefixes startwith the prefix, then give up
  if(table[prefix + "0"] !== undefined) {
    // left exists
    output.left = {
      val: table[prefix + "0"]
    }
  } else {
    output.left = {}
    // only continue if we're still part of a prefix
    let still = Object.keys(table).filter(x => x.startsWith(prefix + "0")).length > 0
    if(still) {
      recurseTree(table, prefix + "0", output.left)
    }
  }
  if(table[prefix + "1"] !== undefined) {
    output.right = {
      val: table[prefix + "1"]
    }
  } else {
    output.right = {}
    let still = Object.keys(table).filter(x => x.startsWith(prefix + "1")).length > 0
    if(still) {
      recurseTree(table, prefix + "1", output.right)
    }
  }
  return output
}

const appendArray = (arr, add, count) => {
  for (let i = 0; i < count; i++) {
    arr.push(add);
  }
};

// creates tables from alphabet counts
export const createTable = (arr, alph) => {
  const counts = [];
  appendArray(counts, 0, Math.max(...arr) + 1);
  for (let i = 0; i < arr.length; i++) {
    if(arr[i] !== 0) {
      counts[arr[i]] += 1;
    }
  }
  // now we have to check the 'next codes for each length'
  let code = 0;
  const nextCode = [];
  appendArray(nextCode, 0, Math.max(...arr) + 1);
  for (let bits = 1; bits < Math.max(...arr) + 1; bits++) {
    code = (code + counts[bits- 1]) << 1;
    nextCode[bits] = code;
  }

  const codes = [];
  // fill it with zeros
  appendArray(codes, 0, alph.length);
  for (let n = 0; n < arr.length; n++) {
    const len = arr[n];
    if (len !== 0) {
      codes[n] = nextCode[len].toString(2).padStart(len, '0');
      nextCode[len]++;
    }
  }
  return codes;
};

const lenAlpha = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287]

const staticTable = (() => {
  const arr = [];
  appendArray(arr, 8, 144);
  appendArray(arr, 9, 112);
  appendArray(arr, 7, 24);
  appendArray(arr, 8, 8);
  // this array is now byte count ready. Lets make the table
  const table = createTable(arr, lenAlpha);
  return table;
})();

export default {
  table: createTable,
  staticTable,
};
