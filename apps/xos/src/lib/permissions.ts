import type { SessionUser } from "@/lib/auth";

/**
 * CEO: full access + can decide.
 * EXEC: view all + verify proofs.
 * OWNER: view own commitments + submit proof + add slippage reasons.
 * VIEWER: read-only.
 */

export function canVerifyProof(user: SessionUser): boolean {
  return user.role === "CEO" || user.role === "EXEC";
}

export function canDecide(user: SessionUser): boolean {
  return user.role === "CEO";
}

export function canMarkSlippageReason(user: SessionUser, ownerId: string): boolean {
  if (user.role === "CEO" || user.role === "EXEC") return true;
  if (user.role === "OWNER") {
    return true;
  }
  return false;
}

export function canAccessCommitment(
  user: SessionUser,
  commitmentOwnerId: string
): boolean {
  if (user.role === "CEO" || user.role === "EXEC" || user.role === "VIEWER") {
    return true;
  }
  if (user.role === "OWNER") {
    return true;
  }
  return false;
}

export function canMarkDone(user: SessionUser): boolean {
  return user.role === "CEO" || user.role === "EXEC" || user.role === "OWNER";
}

export function canAccessAdmin(user: SessionUser): boolean {
  return user.role === "CEO" || user.role === "EXEC";
}
