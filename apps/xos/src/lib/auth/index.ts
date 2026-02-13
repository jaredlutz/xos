import { getUser } from "@workos-inc/authkit-nextjs";
import { getSession } from "./workos";
import type { SessionUser } from "./workos";

export type { SessionUser };

export { getSession } from "./workos";

/**
 * Require auth; throws if not signed in. Returns session user.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    throw new AuthError("Unauthorized");
  }
  return user;
}

/**
 * Require one of the given roles; throws if not signed in or role not allowed.
 */
export async function requireRole(
  allowedRoles: Array<"CEO" | "EXEC" | "OWNER" | "VIEWER">
): Promise<SessionUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError("Forbidden");
  }
  return user;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Check if current request has a valid WorkOS session (for middleware or route guard).
 */
export async function hasValidSession(): Promise<boolean> {
  const info = await getUser({ ensureSignedIn: false });
  return !!info.user?.email;
}
