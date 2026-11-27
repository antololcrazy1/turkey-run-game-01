// Small seeded RNG so screenshot scenes and playtests are reproducible.
export function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return {
    next() {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    },
    range(lo, hi) { return lo + this.next() * (hi - lo); },
    int(lo, hi) { return Math.floor(this.range(lo, hi + 1)); },
    pick(list) { return list[Math.floor(this.next() * list.length)]; },
  };
}
