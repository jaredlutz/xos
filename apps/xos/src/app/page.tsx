import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-2">xOS</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        CEO Operating System — commitments, proof, slippage, decisions.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
