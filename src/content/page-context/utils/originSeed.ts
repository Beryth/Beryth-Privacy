export async function computeOriginSeed(
  origin: string,
  salt: string
): Promise<number> {
  const data = new TextEncoder().encode(`${salt}::${origin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const view = new DataView(digest);
  return view.getUint32(0, false);
}
