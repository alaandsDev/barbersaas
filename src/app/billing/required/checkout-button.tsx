"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CheckoutButton({ plan }: { plan: "BASIC" | "PRO" | "PREMIUM" }) {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) location.href = data.url;
      else { toast.error(data.error ?? "Erro ao iniciar checkout"); setLoading(false); }
    } catch (e) {
      toast.error("Erro de conexão");
      setLoading(false);
    }
  }

  return (
    <Button onClick={onClick} disabled={loading} className="w-full">
      {loading ? "Carregando..." : "Assinar"}
    </Button>
  );
}
