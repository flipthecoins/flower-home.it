// Avoid Uint8Array.from(string, callback): its per-byte allocations can exhaust
// the Worker CPU budget for uploaded logos. Recent runtimes decode natively.
export function decodeMediaBytes(base64) {
  if (typeof Uint8Array.fromBase64 === 'function') return Uint8Array.fromBase64(base64);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
