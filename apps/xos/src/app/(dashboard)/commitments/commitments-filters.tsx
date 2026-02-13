"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Owner } from "@/lib/db/schema";
import type { System } from "@/lib/db/schema";

export function CommitmentsFilters({
  owners,
  systems,
}: {
  owners: Owner[];
  systems: System[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/commitments?${next.toString()}`);
  }

  const ownerId = searchParams.get("owner_id") ?? "";
  const systemId = searchParams.get("system_id") ?? "";
  const blastRadius = searchParams.get("blast_radius") ?? "";
  const sort = searchParams.get("sort") ?? "due_asc";

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg border bg-muted/30">
      <span className="text-sm font-medium">Filters</span>
      <select
        value={ownerId}
        onChange={(e) => setFilter("owner_id", e.target.value)}
        className="rounded border px-3 py-1.5 text-sm"
      >
        <option value="">All owners</option>
        {owners.map((o) => (
          <option key={o.id} value={o.id}>{o.displayName}</option>
        ))}
      </select>
      <select
        value={systemId}
        onChange={(e) => setFilter("system_id", e.target.value)}
        className="rounded border px-3 py-1.5 text-sm"
      >
        <option value="">All systems</option>
        {systems.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <select
        value={blastRadius}
        onChange={(e) => setFilter("blast_radius", e.target.value)}
        className="rounded border px-3 py-1.5 text-sm"
      >
        <option value="">All blast radius</option>
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
      </select>
      <span className="text-sm font-medium ml-2">Sort</span>
      <select
        value={sort}
        onChange={(e) => setFilter("sort", e.target.value)}
        className="rounded border px-3 py-1.5 text-sm"
      >
        <option value="due_asc">Due date (earliest first)</option>
        <option value="due_desc">Due date (latest first)</option>
        <option value="priority">Priority</option>
      </select>
    </div>
  );
}
