import Link from "next/link";
import { Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-base font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Scissors className="h-3.5 w-3.5" />
          </span>
          BarberOS
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="#features" className="rounded-md px-3 py-2 text-sm text-slate-600 hover:text-slate-900">Funcionalidades</Link>
          <Link href="#como-funciona" className="rounded-md px-3 py-2 text-sm text-slate-600 hover:text-slate-900">Como funciona</Link>
          <Link href="#planos" className="rounded-md px-3 py-2 text-sm text-slate-600 hover:text-slate-900">Preços</Link>
          <Link href="#faq" className="rounded-md px-3 py-2 text-sm text-slate-600 hover:text-slate-900">FAQ</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm"><Link href="/login">Entrar</Link></Button>
          <Button asChild size="sm"><Link href="/signup">Começar grátis</Link></Button>
        </div>
      </div>
    </header>
  );
}
