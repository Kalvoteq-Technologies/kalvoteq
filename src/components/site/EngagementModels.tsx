import { Section } from "@/components/site/Primitives";
import { engagementModels } from "@/data/site";

export function EngagementModels() {
  return (
    <Section
      id="engagement-models"
      eyebrow="Engagement Models"
      title="Flexible Ways to Work With Us"
      intro="Whether you need one specialist or a full delivery unit, choose the model that fits how your organisation works."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {engagementModels.map((model) => (
          <div
            key={model.slug}
            id={model.slug}
            className="card-hover rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-lg font-semibold">{model.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{model.text}</p>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.08em] text-primary">
              Best for
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{model.bestFor}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
