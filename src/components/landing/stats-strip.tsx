export function StatsStrip() {
  const stats = [
    { value: "+200", label: "Barbearias" },
    { value: "+50k", label: "Agendamentos no último mês" },
    { value: "R$ 2.4M", label: "Processados em 2025" },
    { value: "98%", label: "Satisfação" },
  ];
  return (
    <section className="border-y bg-white py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl font-bold tracking-tight md:text-4xl">{s.value}</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
