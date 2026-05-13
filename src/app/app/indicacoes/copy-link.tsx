"use client";

import { useState } from "react";

export function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
    >
      {copied ? "Copiado!" : "Copiar link"}
    </button>
  );
}
