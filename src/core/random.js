export function shuffle(items, rng = Math.random) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function rollChance(percent, rng = Math.random) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  return rng() * 100 < p;
}

export function createId(prefix = "reading", rng = Math.random) {
  return `${prefix}_${Date.now()}_${Math.floor(rng() * 10_000)}`;
}
