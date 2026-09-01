import { Fragment } from "react";

import type { TickerItem } from "@/data/ticker";

// A horizontally scrolling strip of recent technology developments, placed
// between the header and hero on the homepage. Purely presentational — takes
// `items` as a prop so the source (static seed data today, a live query
// against the content-intelligence pipeline later) can change without
// touching this component.

function TickerEntry({ item, inTrack }: { item: TickerItem; inTrack: boolean }) {
  return (
    <a
      href={item.url}
      {...(item.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      tabIndex={inTrack ? -1 : undefined}
      className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-sm px-1 py-1 text-sm text-ink-muted transition-colors hover:text-ink-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="font-semibold text-ink-foreground">{item.category}</span>
      <span aria-hidden="true">—</span>
      <span>{item.headline}</span>
      {item.shortText && (
        <span className="hidden text-ink-muted/70 lg:inline">· {item.shortText}</span>
      )}
      {item.isNew && (
        <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-primary">
          New
        </span>
      )}
    </a>
  );
}

function TickerRow({ items, inTrack }: { items: TickerItem[]; inTrack: boolean }) {
  return (
    <div className="flex flex-shrink-0 items-center gap-6 pr-6" aria-hidden={inTrack || undefined}>
      {items.map((item) => (
        <Fragment key={item.id}>
          <TickerEntry item={item} inTrack={inTrack} />
          <span aria-hidden="true" className="h-1 w-1 flex-shrink-0 rounded-full bg-white/20" />
        </Fragment>
      ))}
    </div>
  );
}

export function TechInsightsTicker({ items }: { items: TickerItem[] }) {
  if (items.length === 0) return null;

  return (
    <div
      className="border-b border-white/10 bg-ink"
      role="region"
      aria-label="Technology insights ticker"
    >
      <div className="flex h-16 items-stretch">
        <div className="flex flex-shrink-0 items-center gap-2 border-r border-white/10 px-4 sm:px-6">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:hidden" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-ink-foreground">
            <span className="hidden sm:inline">Tech Insights</span>
            <span className="sm:hidden">Insights</span>
          </span>
        </div>

        <div className="group relative flex-1 overflow-hidden">
          <div className="ticker-track flex h-full w-max items-center group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
            {/* Two identical copies placed side by side; the track animates exactly
                -50% so the loop point is invisible. The second copy is inert and
                hidden from assistive tech — it exists purely for the visual scroll. */}
            <TickerRow items={items} inTrack={false} />
            <div aria-hidden="true" inert>
              <TickerRow items={items} inTrack />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-ink to-transparent" />
        </div>
      </div>
    </div>
  );
}
