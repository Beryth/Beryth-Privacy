export function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function getSessionSalt(): string {
  const KEY = "__gk_salt__";
  try {
    let s = sessionStorage.getItem(KEY);
    if (!s) {
      s = Array.from(crypto.getRandomValues(new Uint8Array(8)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      sessionStorage.setItem(KEY, s);
    }
    return s;
  } catch {
    return "beryth-fallback-salt";
  }
}

export const ORIGIN_SEED = hashString(location.origin + "::" + getSessionSalt() + "::berythprivacy");

export function seededRandom(seed: number): () => number {
  let a = seed >>> 0; 
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
