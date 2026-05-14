"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function PublicLinkBanner({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-gradient-to-r from-primary to-[hsl(230,60%,22%)] p-4 text-white sm:flex-row sm:items-center">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15">
        <Link2 className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">Sua página pública de agendamento</div>
        <div className="mt-1 truncate font-mono text-xs text-white/70">{url}</div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link copiado");
            setTimeout(() => setCopied(false), 1500);
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
        <Link
          href={url}
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-md bg-amber-400 px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-300"
        >
          Abrir <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
