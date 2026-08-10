"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminTrigger() {
  const [keys, setKeys] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      setKeys((prev) => {
        const newKeys = [...prev, key].slice(-3); // Keep last 3 keys
        if (newKeys.join("") === "ilu") {
          router.push("/admin");
          return []; // Reset after trigger
        }
        return newKeys;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}
