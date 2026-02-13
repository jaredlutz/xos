import crypto from "crypto";

/**
 * Verify webhook signature using HMAC SHA256 and constant-time comparison.
 * Returns true only if signature matches; never log secret or full signature.
 */
export function verifyXosSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  if (expected.length !== signature.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
