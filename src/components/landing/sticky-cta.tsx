"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export function StickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="text-xs">
          <div className="font-bold">3 dias grátis</div>
          <div className="text-slate-500">Sem cartão</div>
        </div>
        <Link
          href="/signup"
          className="inline-flex items-center gap-1 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-amber-950 shadow-md hover:bg-amber-300"
        >
          Começar grátis <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
