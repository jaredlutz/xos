import { getUser } from "@workos-inc/authkit-nextjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "CEO" | "EXEC" | "OWNER" | "VIEWER";
  workosId: string | null;
};

/**
 * Get current session from WorkOS and sync user to DB. Returns DB user + role.
 */
export async function getSession(): Promise<SessionUser | null> {
  const info = await getUser({ ensureSignedIn: false });
  const workosUser = info.user;
  if (!workosUser?.email) return null;

  const workosId = "id" in workosUser ? String(workosUser.id) : null;
  const [dbUser] = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.email, workosUser.email),
        ...(workosId ? [eq(users.workosId, workosId)] : [])
      )
    )
    .limit(1);

  if (dbUser) {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as SessionUser["role"],
      workosId: dbUser.workosId,
    };
  }

  const w = workosUser as { email: string; firstName?: string; lastName?: string };
  const name = [w.firstName, w.lastName].filter(Boolean).join(" ").trim() || w.email;
  const [inserted] = await db
    .insert(users)
    .values({
      email: w.email,
      name: name || w.email,
      role: "VIEWER",
      workosId,
    })
    .returning();

  if (!inserted) return null;
  return {
    id: inserted.id,
    email: inserted.email,
    name: inserted.name,
    role: inserted.role as SessionUser["role"],
    workosId: inserted.workosId,
  };
}
