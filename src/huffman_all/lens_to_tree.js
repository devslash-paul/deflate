export const lenToTree  = (lens) => {
  // count the number of codes for each code lengths. Let
  // bl_count[N] be the number of codes of length N N >=1
  let bl_count = [0]
  for(var i = 1; i <= Math.max(...lens); i++) {
    bl_count[i] = 0
  }

  for(var i = 0; i < lens.length; i++) {
    if(lens[i] !== 0) {
      bl_count[lens[i]] += 1
    }
  }

  let code = 0
  let next_code = [0]
  for(var bits = 1; bits <= Math.max(...lens); bits++) {
    code = (code + bl_count[bits - 1]) << 1
    next_code[bits] = code
  }

  const codes = [];
  for (let n = 0; n < lens.length; n++) {
    const len = lens[n];
    if (len !== 0) {
      codes[n] = next_code[len].toString(2).padStart(len, '0');
      next_code[len]++;
    }
  }
  return codes;
}

export const toHuffman = (codes, alph) => {
  let exp = {}
  for(var i = 0; i < codes.length; i++) {
    if(codes[i] !== undefined) {
      exp[codes[i]] = i
    }
  }
  return exp
}