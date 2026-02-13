"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/commitments", label: "Commitments" },
  { href: "/decisions", label: "Decisions" },
  { href: "/admin/systems", label: "Systems" },
  { href: "/admin/owners", label: "Owners" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 border-r bg-card p-4">
      <Link href="/" className="font-semibold text-lg block mb-6">
        xOS
      </Link>
      <nav className="space-y-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block px-3 py-2 rounded-md text-sm",
              pathname?.startsWith(item.href)
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
