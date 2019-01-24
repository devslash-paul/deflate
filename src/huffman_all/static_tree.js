
const fill = (arr, st, end, fi) => {
  for(var i = st; i < end; i++) {
    arr[i] = fi
  }
}

export const getStaticCodeLens = () => {
  const llcodelens = [];
  fill(llcodelens,   0, 144, 8);
  fill(llcodelens, 144, 256, 9);
  fill(llcodelens, 256, 280, 7);
  fill(llcodelens, 280, 288, 8);
  return llcodelens
}

export const getStaticDistanceLengths = () => {
  const distlens = []
  fill(distlens, 0, 32, 5)
  return distlens
}