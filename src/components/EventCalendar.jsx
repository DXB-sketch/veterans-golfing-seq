import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DayPicker } from "react-day-picker";

// Event dates come from Supabase as "YYYY-MM-DD"; render them as local dates
// so the highlighted square never drifts a day on other time zones.
function isoToDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

// Month calendar for the Events header (dark, on navy). Reads the same
// live event list as the page — days with an event are gold and click
// through to the event page.
export default function EventCalendar({ events, className = "" }) {
  const navigate = useNavigate();

  const eventsByDate = useMemo(() => {
    const map = new Map();
    for (const e of events) {
      if (!e.date) continue;
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date).push(e);
    }
    return map;
  }, [events]);

  const eventDates = useMemo(
    () => [...eventsByDate.keys()].map(isoToDate),
    [eventsByDate]
  );

  // Open on the month of the next event; cover every event year in the
  // dropdowns with a little room either side.
  const { defaultMonth, startMonth, endMonth } = useMemo(() => {
    const now = new Date();
    const next = events.find((e) => e.timeStatus !== "finalised" && e.date);
    const years = [...eventsByDate.keys()].map((d) => Number(d.slice(0, 4)));
    const minYear = Math.min(now.getFullYear() - 1, ...years);
    const maxYear = Math.max(now.getFullYear() + 1, ...years);
    return {
      defaultMonth: next ? isoToDate(next.date) : now,
      startMonth: new Date(minYear, 0),
      endMonth: new Date(maxYear, 11),
    };
  }, [events, eventsByDate]);

  // Follow the next event's month until the visitor navigates themselves —
  // then their choice wins, even if the events finish loading afterwards.
  const [pickedMonth, setPickedMonth] = useState(null);

  const handleDayClick = (day) => {
    const dayEvents = eventsByDate.get(dateKey(day));
    if (dayEvents?.length) navigate(`/events/${dayEvents[0].id}`);
  };

  return (
    <div
      className={`w-fit rounded-card border border-gold/25 bg-navy-deep/70 p-4 shadow-soft sm:p-5 ${className}`}
    >
      <DayPicker
        mode="single"
        captionLayout="dropdown"
        month={pickedMonth ?? defaultMonth}
        onMonthChange={setPickedMonth}
        startMonth={startMonth}
        endMonth={endMonth}
        modifiers={{ hasEvent: eventDates }}
        modifiersClassNames={{
          hasEvent:
            "[&>button]:bg-gold [&>button]:font-bold [&>button]:text-navy-deep [&>button]:cursor-pointer hover:[&>button]:bg-gold-bright focus-visible:[&>button]:bg-gold-bright",
        }}
        onDayClick={handleDayClick}
        classNames={{
          root: "font-body text-cream",
          months: "relative",
          month: "w-full",
          nav: "absolute inset-x-0 top-0 flex items-center justify-between",
          button_previous:
            "flex h-9 w-9 items-center justify-center rounded-card text-cream/70 transition-colors hover:bg-gold/15 hover:text-gold-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold",
          button_next:
            "flex h-9 w-9 items-center justify-center rounded-card text-cream/70 transition-colors hover:bg-gold/15 hover:text-gold-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold",
          chevron: "h-5 w-5 fill-current",
          month_caption: "flex h-9 items-center justify-center",
          dropdowns: "flex items-center gap-2",
          dropdown_root:
            "relative inline-flex items-center rounded-card px-1 transition-colors hover:bg-gold/15 focus-within:outline focus-within:outline-2 focus-within:outline-gold",
          dropdown: "absolute inset-0 cursor-pointer opacity-0",
          caption_label:
            "flex items-center gap-1 font-display text-base font-bold uppercase tracking-wide text-white",
          month_grid: "mt-3 border-separate border-spacing-y-1",
          weekdays: "",
          weekday:
            "pb-1 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-gold",
          day: "p-0 text-center",
          day_button:
            "h-10 w-10 rounded-card text-[0.9375rem] text-cream/90 sm:h-11 sm:w-11",
          today: "[&>button]:ring-1 [&>button]:ring-inset [&>button]:ring-gold/60",
          outside: "[&>button]:text-cream/30",
          hidden: "invisible",
        }}
      />
      <p className="mt-2 flex items-center gap-2 border-t border-gold/15 pt-3 text-xs text-cream/70">
        <span
          className="inline-block h-3 w-3 rounded-[2px] bg-gold"
          aria-hidden="true"
        />
        Event day — select it to view the event
      </p>
    </div>
  );
}
