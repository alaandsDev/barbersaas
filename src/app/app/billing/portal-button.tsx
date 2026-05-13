"use client";

import { useState } from "react";

export function PortalButton() {
  const [loading, setLoading] = useState(false);
  async function onClick() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) location.href = data.url;
    else { alert(data.error ?? "Erro"); setLoading(false); }
  }
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "..." : "Gerenciar assinatura"}
    </button>
  );
}
