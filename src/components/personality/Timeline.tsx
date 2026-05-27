import type { TimelineEvent } from "@/types/database.types";

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  if (!events.length) return null;

  return (
    <div className="relative max-w-3xl space-y-0">
      <div className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-primary/40 via-gris-bordure to-transparent" />

      {events.map((event, index) => (
        <div key={event.id} className="relative flex gap-6 pb-8 last:pb-0">
          <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/30 bg-blanc shadow-sm">
              <div className="h-3 w-3 rounded-full bg-primary" />
            </div>
          </div>

          <div className="min-w-0 flex-1 rounded-xl border border-gris-bordure/80 bg-gris-clair/20 p-5 transition-colors hover:border-primary/20 hover:bg-primary-light/20">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
                {event.event_date}
              </span>
              {index === 0 && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-gris-moyen">
                  Début
                </span>
              )}
            </div>
            <h4 className="mt-2 font-serif text-lg font-semibold text-noir">
              {event.title}
            </h4>
            {event.description && (
              <p className="mt-2 text-sm leading-relaxed text-gris-moyen">
                {event.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
