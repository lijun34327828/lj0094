export function generateCombinations<T>(items: T[], minSize: number, maxSize: number): T[][] {
  const results: T[][] = [];
  const n = items.length;
  const actualMax = Math.min(maxSize, n);

  for (let size = minSize; size <= actualMax; size++) {
    const indices = Array.from({ length: size }, (_, i) => i);
    while (true) {
      results.push(indices.map(i => items[i]));
      let i = size - 1;
      while (i >= 0 && indices[i] === n - size + i) i--;
      if (i < 0) break;
      indices[i]++;
      for (let j = i + 1; j < size; j++) {
        indices[j] = indices[j - 1] + 1;
      }
    }
  }
  return results;
}

export function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function gcdArray(arr: number[]): number {
  return arr.reduce((acc, val) => gcd(acc, val));
}
