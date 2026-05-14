"use client";

import { useRouter } from "next/navigation";
import { WeekCalendar } from "./week-calendar";

type Appt = React.ComponentProps<typeof WeekCalendar>["appointments"][number];

export function WeekShell({ appointments, weekStartISO }: { appointments: Appt[]; weekStartISO: string }) {
  const router = useRouter();
  const weekStart = new Date(weekStartISO);

  function setWeek(d: Date) {
    const iso = d.toISOString().slice(0, 10);
    router.push(`/app/agenda?view=week&week=${iso}`);
  }

  return <WeekCalendar appointments={appointments} weekStart={weekStart} onWeekChange={setWeek} />;
}
