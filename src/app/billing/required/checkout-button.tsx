"use client";

import { useState } from "react";

export function CheckoutButton({ plan }: { plan: "BASIC" | "PRO" | "PREMIUM" }) {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) location.href = data.url;
    else { alert(data.error ?? "Erro"); setLoading(false); }
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full rounded-lg bg-brand py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "..." : "Assinar"}
    </button>
  );
}
