"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrowserMockup } from "./browser-mockup";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="glow-accent" />
      <div className="absolute inset-0 -z-10 bg-grid" />

      <div className="mx-auto max-w-6xl px-6 pt-16 pb-24 text-center md:pt-24 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
        >
          <Sparkles className="h-3 w-3" />
          Novo: 3 dias grátis sem cartão de crédito
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-balance mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
        >
          <span className="text-gradient">A forma mais simples de gerenciar sua barbearia</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-balance mx-auto mt-6 max-w-2xl text-lg text-slate-600 md:text-xl"
        >
          Agenda, clientes, equipe e financeiro em um só lugar. Sem planilha, sem caderno, sem perder cliente.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg" variant="accent" className="h-12 px-7 text-base">
            <Link href="/signup">Começar grátis <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
            <Link href="#planos">Ver planos</Link>
          </Button>
        </motion.div>
        <p className="mt-4 text-xs text-slate-500">3 dias grátis · Sem cartão · Cancele quando quiser</p>

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
