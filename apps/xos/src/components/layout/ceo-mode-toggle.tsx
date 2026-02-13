"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const CEO_MODE_KEY = "xos_ceo_mode";

function getStored(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const v = localStorage.getItem(CEO_MODE_KEY);
    return v === "true";
  } catch {
    return false;
  }
}

export function CeoModeToggle() {
  const router = useRouter();
  const [ceoMode, setCeoMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCeoMode(getStored());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetch("/api/user/prefs")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && typeof data.ceo_mode === "boolean") {
          setCeoMode(data.ceo_mode);
          try {
            localStorage.setItem(CEO_MODE_KEY, String(data.ceo_mode));
          } catch {}
        }
      })
      .catch(() => {});
  }, [mounted]);

  async function handleToggle() {
    const next = !ceoMode;
    setCeoMode(next);
    try {
      localStorage.setItem(CEO_MODE_KEY, String(next));
    } catch {}
    try {
      await fetch("/api/user/prefs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ceo_mode: next }),
      });
    } catch {}
    router.refresh();
  }

  return (
    <Button
      variant={ceoMode ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
    >
      CEO mode {ceoMode ? "on" : "off"}
    </Button>
  );
}
