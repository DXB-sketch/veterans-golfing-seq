import { useLayoutEffect, useRef, useState } from "react";
import Section from "../components/Section.jsx";
import RibbonRule from "../components/RibbonRule.jsx";
import { values } from "../data/values.js";

// Roadmap entries. Grounded in the club's 2026/2027 plan; dates beyond the
// Gold Coast Open Day are indicative and marked TBC where unconfirmed.
const roadmap = [
  {
    when: "Early 2026",
    title: "The club gets started",
    detail:
      "SEQDVGC forms as a registered non-profit incorporated association and begins organising its first golf days across Brisbane, the Sunshine Coast and the Gold Coast.",
  },
  {
    when: "31 July 2026",
    title: "Gold Coast Open Day",
    detail:
      "Our first official open day at Palmer Gold Coast Golf Course, Robina. 18 holes, an optional side comp, and every veteran and family member welcome.",
  },
  {
    when: "Late 2026",
    title: "Second club event",
    detail:
      "A second event to close out the year, with details to be confirmed. Follow us on Facebook for the announcement.",
  },
  {
    when: "Early 2027",
    title: "Membership opens",
    detail:
      "Club membership launches at $50 a year. Members compete through the season and secure their place at the end-of-year championship.",
  },
  {
    when: "Through 2027",
    title: "The regional series",
    detail:
      "A series of rounds through the year in each of the three regions, building a strong, connected Defence veteran golf community.",
  },
  {
    when: "End of 2027",
    title: "The championship",
    detail:
      "A multi-day end-of-year championship bringing the whole club together, with spots earned through the regional series.",
  },
];

function TimelineEntry({ item }) {
  return (
    <div>
      <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-gold">
        {item.when}
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold tracking-wide text-navy">
        {item.title}
      </h3>
      <p className="mt-1.5 text-sm text-ink-muted">{item.detail}</p>
    </div>
  );
}

// Desktop: one continuous hand-drawn-feeling gold line that waves through
// the milestones left-to-right, makes a smooth U-turn at the edge, and
// flows back the other way. Drawn as a single SVG path measured against
// the real layout, so it never collides with the text. Mobile: simple
// vertical line down the left.
const TURN_PAD = 72; // horizontal room reserved for the U-turns
const LINE_Y = 26; // where the line crosses, relative to each row's top
const ROW_PT = 72; // row top padding: text starts well clear of the line
const COL_GAP = 48;

function SnakeTimeline({ items, perRow = 3 }) {
  const containerRef = useRef(null);
  const rowRefs = useRef([]);
  const [geo, setGeo] = useState(null);

  const rows = [];
  for (let i = 0; i < items.length; i += perRow) rows.push(items.slice(i, i + perRow));

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function measure() {
      const w = el.offsetWidth;
      const h = el.scrollHeight;
      if (!w) return;

      const innerW = w - 2 * TURN_PAD;
      const colW = (innerW - (perRow - 1) * COL_GAP) / perRow;
      const colLeft = (c) => TURN_PAD + c * (colW + COL_GAP);

      // Node coordinates in sequence order.
      const nodes = [];
      rows.forEach((row, r) => {
        const rowEl = rowRefs.current[r];
        if (!rowEl) return;
        const y = rowEl.offsetTop + LINE_Y;
        const dir = r % 2 === 0 ? 1 : -1;
        row.forEach((item, i) => {
          const col = dir === 1 ? i : perRow - 1 - i;
          nodes.push({ x: colLeft(col) + 8, y, row: r, dir });
        });
      });
      if (nodes.length < 2) return;

      // Gentle wave between points on the same row, smooth arc between rows.
      let d = `M ${nodes[0].x - 44} ${nodes[0].y + 16} Q ${nodes[0].x - 26} ${nodes[0].y} ${nodes[0].x} ${nodes[0].y}`;
      let flip = 1;
      for (let i = 1; i < nodes.length; i++) {
        const a = nodes[i - 1];
        const b = nodes[i];
        if (a.row === b.row) {
          const mx1 = a.x + (b.x - a.x) * 0.35;
          const mx2 = a.x + (b.x - a.x) * 0.65;
          const amp = 16 * flip;
          d += ` C ${mx1} ${a.y + amp}, ${mx2} ${b.y - amp}, ${b.x} ${b.y}`;
          flip = -flip;
        } else {
          // Glide out past the text column, then a full rounded U-turn.
          const edgeX = a.dir === 1 ? w - 34 : 34;
          const ctrlX = a.dir === 1 ? w + 10 : -10;
          d += ` C ${a.x + (edgeX - a.x) * 0.4} ${a.y + 14}, ${a.x + (edgeX - a.x) * 0.75} ${a.y}, ${edgeX} ${a.y}`;
          d += ` C ${ctrlX} ${a.y}, ${ctrlX} ${b.y}, ${edgeX} ${b.y}`;
          d += ` C ${edgeX - (edgeX - b.x) * 0.35} ${b.y}, ${edgeX - (edgeX - b.x) * 0.65} ${b.y - 14}, ${b.x} ${b.y}`;
          flip = 1;
        }
      }
      const last = nodes[nodes.length - 1];
      const tailDir = last.dir === 1 ? 1 : -1;
      d += ` Q ${last.x + 26 * tailDir} ${last.y} ${last.x + 44 * tailDir} ${last.y + 16}`;

      setGeo({ w, h, d, nodes });
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready?.then(measure);
    return () => ro.disconnect();
  }, [items.length, perRow]);

  return (
    <>
      {/* Mobile: vertical */}
      <ol className="relative ml-1 border-l-2 border-gold/60 md:hidden">
        {items.map((item) => (
          <li key={item.title} className="relative pb-10 pl-7 last:pb-0">
            <span className="absolute -left-[7px] top-1 h-3 w-3 rotate-45 bg-gold" aria-hidden="true" />
            <TimelineEntry item={item} />
          </li>
        ))}
      </ol>

      {/* Desktop: flowing snake */}
      <div ref={containerRef} className="relative hidden md:block">
        {geo && (
          <svg
            className="pointer-events-none absolute inset-0"
            width={geo.w}
            height={geo.h}
            viewBox={`0 0 ${geo.w} ${geo.h}`}
            aria-hidden="true"
          >
            <path
              d={geo.d}
              fill="none"
              stroke="#C8A02E"
              strokeOpacity="0.55"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {geo.nodes.map((n, i) => (
              <rect
                key={i}
                x="-6"
                y="-6"
                width="12"
                height="12"
                fill="#C8A02E"
                transform={`translate(${n.x} ${n.y}) rotate(45)`}
              />
            ))}
          </svg>
        )}
        {rows.map((row, r) => {
          const reversed = r % 2 === 1;
          return (
            <div
              key={r}
              ref={(node) => (rowRefs.current[r] = node)}
              className="grid gap-x-12 pb-12 last:pb-0"
              style={{
                gridTemplateColumns: `repeat(${perRow}, minmax(0, 1fr))`,
                paddingTop: ROW_PT,
                paddingLeft: TURN_PAD,
                paddingRight: TURN_PAD,
              }}
            >
              {row.map((item, i) => (
                <div
                  key={item.title}
                  style={{ gridColumn: (reversed ? perRow - 1 - i : i) + 1, gridRow: 1 }}
                >
                  <TimelineEntry item={item} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function About() {
  return (
    <>
      {/* Light hero: About is the one page that opens on cream, with the
          crest given room to breathe. */}
      <section className="border-b border-ink/10 bg-cream px-5 py-16 md:py-20">
        <div className="mx-auto flex max-w-site flex-col items-start gap-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
              About SEQDVGC
            </p>
            <h1 className="text-page-title mt-3 font-display font-bold uppercase text-navy">
              Who we are
            </h1>
            <RibbonRule className="mt-5" />
            <p className="mt-6 max-w-xl text-lg text-ink-muted">
              United by service. Connected by golf.
            </p>
          </div>
          <img
            src="/SEQDVGC-logo-transparent.png"
            alt="SEQDVGC crest"
            className="h-40 w-40 shrink-0 md:h-52 md:w-52"
          />
        </div>
      </section>

      <Section eyebrow="Our story" title="A club built on mateship" tone="paper">
        <div className="max-w-[68ch] space-y-5">
          <p>
            The South East Queensland Defence Veterans Golf Club is an
            Australian Defence veteran community golf group supporting veterans
            and their families. We promote connection, and mental and physical
            wellbeing within the veteran community, through golf.
          </p>
          <p>
            We&apos;re a registered non-profit incorporated association. Every
            dollar we raise through sponsors, government grants and donations
            goes to supporting Australian veteran members and the events we run
            for them.
          </p>
          <p>
            Veteran golfers of all abilities are welcome. All veterans, serving
            and non-serving, and their family members. You don&apos;t need a
            low handicap. You just need to turn up.
          </p>
        </div>
      </Section>

      {/* Roadmap timeline. Snakes across and down the page on desktop,
          stacks vertically on mobile. One continuous connected line. */}
      <Section eyebrow="The road ahead" title="Where we're headed" tone="cream">
        <SnakeTimeline items={roadmap} />
      </Section>

      <Section eyebrow="What we stand for" title="Our values" tone="navy" center>
        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {values.map((v) => (
            <li key={v.label} className="text-center">
              <h3 className="font-display text-lg font-semibold tracking-wide text-gold-bright">
                {v.label}
              </h3>
              <p className="mt-2 text-sm text-cream/80">{v.line}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12 border-t border-gold/15 pt-8">
          <p className="font-body text-base font-bold uppercase tracking-[0.2em] text-cream">
            Army · Navy · Air Force
          </p>
          <p className="mt-2 text-sm text-cream/70">
            Three services. One club. Equal standing, always.
          </p>
        </div>
      </Section>
    </>
  );
}
