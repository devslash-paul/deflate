const appendArray = (arr, add, count) => {
  for (let i = 0; i < count; i++) {
    arr.push(add);
  }
};

// creates tables from alphabet counts
const createTable = (arr, maxAlph) => {
  const counts = [];
  appendArray(counts, 0, Math.max(...arr) + 1);
  for (let i = 0; i < arr.length; i++) {
    counts[arr[i]] += 1;
  }
  // now we have to check the 'next codes for each length'
  let code = 0;
  const nextCode = [];
  appendArray(nextCode, 0, Math.max(...arr) + 1);
  for (let bits = 1; bits < Math.max(...arr) + 1; bits++) {
    code = (code + counts[bits - 1]) << 1;
    nextCode[bits] = code;
  }

  const codes = [];
  // fill it with zeros
  appendArray(codes, 0, maxAlph + 1);
  for (let n = 0; n < maxAlph; n++) {
    const len = arr[n];
    if (len !== 0) {
      codes[n] = nextCode[len].toString(2).padStart(len, '0');
      nextCode[len]++;
    }
  }
  return codes;
};

const staticTable = (() => {
  const arr = [];
  appendArray(arr, 8, 144);
  appendArray(arr, 9, 112);
  appendArray(arr, 7, 24);
  appendArray(arr, 8, 8);
  // this array is now byte count ready. Lets make the table
  const table = createTable(arr, 287);
  return table;
})();

export default {
  table: createTable,
  staticTable,
};
