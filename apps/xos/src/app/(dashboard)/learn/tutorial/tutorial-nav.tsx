"use client";

import Link from "next/link";
import type { LearnTopic } from "@/content/learn";

export function TutorialNav({ topics }: { topics: LearnTopic[] }) {
  return (
    <nav className="flex items-center justify-between gap-4 pt-4 border-t">
      <Link href="/learn" className="text-sm text-muted-foreground hover:underline">
        Back to Learn
      </Link>
      <div className="flex gap-2">
        {topics.map((t, i) => (
          <a
            key={t.slug}
            href={`#${t.slug}`}
            className="rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
            title={t.title}
          >
            {i + 1}
          </a>
        ))}
      </div>
    </nav>
  );
}
