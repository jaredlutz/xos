"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CeoModeToggle() {
  const [ceoMode, setCeoMode] = useState(false);
  return (
    <Button
      variant={ceoMode ? "default" : "outline"}
      size="sm"
      onClick={() => setCeoMode(!ceoMode)}
    >
      CEO mode {ceoMode ? "on" : "off"}
    </Button>
  );
}
