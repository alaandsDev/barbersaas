"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PortalButton() {
  const [loading, setLoading] = useState(false);
  async function onClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) location.href = data.url;
      else { toast.error(data.error ?? "Erro ao abrir portal"); setLoading(false); }
    } catch {
      toast.error("Erro de conexão");
      setLoading(false);
    }
  }
  return (
    <Button onClick={onClick} disabled={loading}>
      {loading ? "Carregando..." : "Gerenciar assinatura"}
    </Button>
  );
}
