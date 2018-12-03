const appendArray = (arr, add, count) => {
  for(var i = 0; i < count; i++) {
    arr.push(add)
  }
}

// creates tables from alphabet counts
const createTable = (arr, max_alph) => {
  var counts = []
  appendArray(counts, 0, Math.max(...arr) + 1)
  for(var i = 0; i < arr.length; i++) {
    counts[arr[i]] += 1
  }
  // now we have to check the 'next codes for each length'
  let code = 0
  let next_code = []
  appendArray(next_code, 0, Math.max(...arr) + 1)
  for(var bits = 1; bits < Math.max(...arr) + 1; bits++) {
    code = (code + counts[bits - 1]) << 1 
    next_code[bits] = code
  }

  let codes = []
  // fill it with zeros
  appendArray(codes, 0, max_alph + 1)
  for(var n = 0; n < max_alph; n++) {
    let len = arr[n]
    if (len !== 0) {
      codes[n] = next_code[len].toString(2).padStart(len, "0")
      next_code[len]++;
    }
  }
  console.log(codes)
  return codes;
}

const staticTable = (() => {
  let arr = []
  appendArray(arr, 8, 144)
  appendArray(arr, 9, 112)
  appendArray(arr, 7, 24)
  appendArray(arr, 8, 8)
  let alphabet = []
  // this array is now byte count ready. Lets make the table
  let table = createTable(arr, 287)
  return table;
})()

export default {
  table: createTable,
  staticTable: staticTable
}