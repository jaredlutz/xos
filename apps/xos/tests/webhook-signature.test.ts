import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifyXosSignature } from "../src/lib/webhooks/verify-signature";

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

describe("verifyXosSignature", () => {
  const payload = '{"systemKey":"test","title":"x"}';
  const secret = "test-secret";

  it("returns true for valid signature", () => {
    const sig = sign(payload, secret);
    expect(verifyXosSignature(payload, sig, secret)).toBe(true);
  });

  it("returns false for wrong secret", () => {
    const sig = sign(payload, secret);
    expect(verifyXosSignature(payload, sig, "other-secret")).toBe(false);
  });

  it("returns false for tampered payload", () => {
    const sig = sign(payload, secret);
    expect(verifyXosSignature('{"systemKey":"other"}', sig, secret)).toBe(false);
  });

  it("returns false for empty signature", () => {
    expect(verifyXosSignature(payload, "", secret)).toBe(false);
  });

  it("returns false for empty secret", () => {
    const sig = sign(payload, secret);
    expect(verifyXosSignature(payload, sig, "")).toBe(false);
  });
});
