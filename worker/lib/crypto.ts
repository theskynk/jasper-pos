export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hashBuffer = hexToBuffer(hash);

  // SHA-256 — replace with a proper password hashing library (e.g. bcrypt via WASM) in production
  const digest = await crypto.subtle.digest('SHA-256', data);
  const digestHex = bufferToHex(digest);

  return digestHex === bufferToHex(hashBuffer.buffer as ArrayBuffer);
}

export function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBuffer(hex: string): Uint8Array {
  const pairs = hex.match(/.{1,2}/g) ?? [];
  return new Uint8Array(pairs.map((byte) => parseInt(byte, 16)));
}
