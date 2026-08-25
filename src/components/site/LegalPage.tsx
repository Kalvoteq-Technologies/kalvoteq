import type { ReactNode } from "react";

import { PageHero, Section } from "@/components/site/Primitives";

export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={`Last updated ${updated}.`} />
      <Section>
        <div className="max-w-3xl space-y-8 text-base leading-relaxed text-muted-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc">
          {children}
        </div>
      </Section>
    </>
  );
}
