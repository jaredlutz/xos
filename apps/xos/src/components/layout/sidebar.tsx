"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

type NavItem = { href: string; label: string };

const overviewNav: NavItem[] = [{ href: "/dashboard", label: "Dashboard" }];

const operationsNav: NavItem[] = [
  { href: "/commitments", label: "Commitments" },
  { href: "/decisions", label: "Decisions" },
];

const educationNav: NavItem[] = [{ href: "/learn", label: "Learn" }];

const analyticsNav: NavItem[] = [
  { href: "/admin/kpis", label: "KPIs" },
  { href: "/admin/signals", label: "Signals" },
];

const adminNav: NavItem[] = [
  { href: "/admin/systems", label: "Systems" },
  { href: "/admin/owners", label: "Owners" },
  { href: "/admin/ceo-actions", label: "CEO Actions" },
];

type SectionKey = "overview" | "operations" | "analytics" | "admin" | "education";

function NavSection({
  title,
  items,
  pathname,
  open,
  onToggle,
}: {
  title: string;
  items: NavItem[];
  pathname: string | null;
  open: boolean;
  onToggle: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-muted-foreground uppercase tracking-wider",
          "hover:bg-accent hover:text-foreground transition-colors text-left"
        )}
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        )}
        <span>{title}</span>
      </button>
      {open && (
        <ul className="space-y-0.5 mt-0.5 ml-1 pl-2 border-l border-muted">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "block px-2 py-1.5 rounded-md text-sm -ml-px",
                  pathname?.startsWith(item.href)
                    ? "bg-primary text-primary-foreground border-l-2 border-primary"
                    : "hover:bg-accent border-l-2 border-transparent"
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Sidebar({ canAccessAdmin = false }: { canAccessAdmin?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    overview: true,
    operations: false,
    analytics: false,
    admin: false,
    education: false,
  });

  const toggle = (key: SectionKey) => () =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside className="w-56 border-r bg-card p-4">
      <Link href="/" className="font-semibold text-lg block mb-6">
        xOS
      </Link>
      <nav>
        <NavSection
          title="Overview"
          items={overviewNav}
          pathname={pathname}
          open={open.overview}
          onToggle={toggle("overview")}
        />
        <NavSection
          title="Operations"
          items={operationsNav}
          pathname={pathname}
          open={open.operations}
          onToggle={toggle("operations")}
        />
        {canAccessAdmin && (
          <>
            <NavSection
              title="Analytics"
              items={analyticsNav}
              pathname={pathname}
              open={open.analytics}
              onToggle={toggle("analytics")}
            />
            <NavSection
              title="Admin"
              items={adminNav}
              pathname={pathname}
              open={open.admin}
              onToggle={toggle("admin")}
            />
          </>
        )}
        <NavSection
          title="Education"
          items={educationNav}
          pathname={pathname}
          open={open.education}
          onToggle={toggle("education")}
        />
      </nav>
    </aside>
  );
}
