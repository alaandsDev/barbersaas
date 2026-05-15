"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrowserMockup } from "./browser-mockup";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="glow-accent" />
      <div className="absolute inset-0 -z-10 bg-grid" />

      <div className="mx-auto max-w-6xl px-6 pt-16 pb-24 text-center md:pt-24 md:pb-32">
        {/* Social proof badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-semibold shadow-sm"
        >
          <div className="flex -space-x-1">
            {["bg-rose-300","bg-amber-300","bg-emerald-300","bg-blue-300"].map((c, i) => (
              <div key={i} className={`h-5 w-5 rounded-full border-2 border-white ${c}`} />
            ))}
          </div>
          <span className="text-slate-700">+200 barbearias usam BarberOS</span>
          <div className="flex">
            {[1,2,3,4,5].map((i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-balance mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
        >
          <span className="text-gradient">Pare de perder cliente. Comece a lucrar.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-balance mx-auto mt-6 max-w-2xl text-lg text-slate-600 md:text-xl"
        >
          O sistema completo pra sua barbearia: agenda online, lembretes automáticos e financeiro em tempo real. Sem caderno, sem planilha, sem dor de cabeça.
        </motion.p>

        {/* outcome chips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
          {[
            "📉 Reduza no-show em até 30%",
            "⏰ Economize 5h por semana",
            "📈 Lucre 20% mais por barbeiro",
          ].map((t) => (
            <span key={t} className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">{t}</span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg" variant="accent" className="h-12 px-7 text-base shadow-lg">
            <Link href="/signup">Começar grátis agora <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
            <Link href="#planos">Ver planos</Link>
          </Button>
        </motion.div>
        <p className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          3 dias grátis · Sem cartão · Cancele quando quiser
        </p>

        {/* mockup */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <BrowserMockup />
        </motion.div>
      </div>
    </section>
  );
}
