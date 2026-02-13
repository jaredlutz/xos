import { redirect } from "next/navigation";
import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { getUser } from "@workos-inc/authkit-nextjs";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const { user } = await getUser({ ensureSignedIn: false });
  if (user?.email) redirect("/dashboard");

  const signInUrl = await getSignInUrl();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">xOS</h1>
      <p className="text-muted-foreground mb-6">Sign in to continue.</p>
      <Button asChild>
        <a href={signInUrl}>Sign in with WorkOS</a>
      </Button>
    </main>
  );
}
