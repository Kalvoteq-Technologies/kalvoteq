import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildScaleOverview } from "@/data/site";

function BuildScaleCard({
  card,
}: {
  card: (typeof buildScaleOverview)["build"] | (typeof buildScaleOverview)["scale"];
}) {
  return (
    <div className="card-hover flex h-full flex-col rounded-2xl border border-border bg-card p-8">
      <h3 className="text-2xl font-bold">{card.title}</h3>
      <p className="mt-3 text-muted-foreground">{card.description}</p>
      <ul className="mt-6 flex-1 space-y-2.5">
        {card.items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Button asChild size="lg" className="mt-8 w-full sm:w-fit">
        <Link to={card.ctaTo}>{card.ctaLabel}</Link>
      </Button>
    </div>
  );
}

export function BuildScaleCards() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <BuildScaleCard card={buildScaleOverview.build} />
      <BuildScaleCard card={buildScaleOverview.scale} />
    </div>
  );
}
