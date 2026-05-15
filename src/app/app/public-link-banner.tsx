"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function PublicLinkBanner({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-r from-[hsl(230,30%,10%)] to-[hsl(230,30%,12%)] p-4 sm:flex-row sm:items-center">
      <div className="absolute inset-0 -z-10 opacity-60 [background:radial-gradient(circle_at_top_right,hsl(38_95%_50%/.10),transparent_60%)]" />
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-400/10 ring-1 ring-amber-400/20">
        <Link2 className="h-4 w-4 text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Link público de agendamento</div>
        <div className="mt-0.5 truncate font-mono text-sm text-foreground/80">{url}</div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true); toast.success("Link copiado");
            setTimeout(() => setCopied(false), 1500);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-white/[0.08]"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
        <Link
          href={url}
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-300"
        >
          Abrir <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
