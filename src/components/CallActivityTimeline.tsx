import type { CallActivityEvent } from "@/types";

interface CallActivityTimelineProps {
  events: CallActivityEvent[];
}

export function CallActivityTimeline({ events }: CallActivityTimelineProps) {
  return (
    <ol className="activity-timeline" data-testid="call-activity-timeline">
      {events.map((event) => (
        <li key={event.id} className={`activity-timeline__item activity-timeline__item--${event.kind}`}>
          <time className="activity-timeline__time" dateTime={event.time}>
            {event.time}
          </time>
          <span className="activity-timeline__label">{event.label}</span>
        </li>
      ))}
    </ol>
  );
}
