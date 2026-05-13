import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BarberOS — Gestão para Barbearias",
  description:
    "A forma mais simples de gerenciar sua barbearia: agenda, clientes, equipe e financeiro em um só lugar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
