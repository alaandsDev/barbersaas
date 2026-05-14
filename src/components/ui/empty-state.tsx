import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function EmptyState({ icon: Icon, title, description, cta }: {
  icon: any; title: string; description: string; cta?: { href: string; label: string };
}) {
  return (
    <Card className="card-elevated flex flex-col items-center gap-3 p-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <div className="text-base font-semibold">{title}</div>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      {cta && (
        <Button asChild variant="accent" size="sm" className="mt-2">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      )}
    </Card>
  );
}
