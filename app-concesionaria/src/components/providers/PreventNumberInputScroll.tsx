"use client";

import { useEffect } from "react";

export default function PreventNumberInputScroll() {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLInputElement;
      if (target.tagName === "INPUT" && target.type === "number") {
        target.blur();
      }
    };
    document.addEventListener("wheel", handleWheel, { passive: true });
    return () => document.removeEventListener("wheel", handleWheel);
  }, []);

  return null;
}
