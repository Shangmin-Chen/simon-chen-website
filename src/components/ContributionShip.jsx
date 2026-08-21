import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import useGithubContributions from '../hooks/useGithubContributions';
import { githubData } from '../data/githubData';

const { ship } = githubData;

// Fixed, not a knob: the SVG below is drawn for exactly 13 stations — widening
// the grid would push windows past the superstructure and off the hull.
const WEEKS = 13;
const ROWS = 7;
const CELLS = WEEKS * ROWS;

// Window column pitch, and the y-centre of every window row. Decks 1–5 carry
// Mon–Fri as cabin windows; the two porthole strakes in the hull are the
// weekend, below deck.
const COL_X0 = 128;
const COL_W = 22;
const DECK_CY = [129, 151, 173, 195, 217];
const PORT_CY = [251, 269];
const DECK_ROWS = DECK_CY.length;

// getDay() is Sun=0 … Sat=6; map it onto the drawing's row order Mon…Fri, Sat, Sun.
const DOW_ROW = [6, 0, 1, 2, 3, 4, 5];

// Hull: sheer line aft-to-bow, raked stem, keel, cruiser stern.
const HULL_D =
  'M436 230 L150 230 C110 230 72 224 44 213 C58 262 96 293 150 299 L400 299 C424 299 436 287 436 269 Z';

// The full plate includes the annotation margins; the compact box crops to the
// vessel alone once the drawing is too small to carry them.
const VIEWBOX_FULL = '0 0 490 350';
const VIEWBOX_COMPACT = '30 30 420 285';

// Annotations are set at 8px in a 490-unit viewBox, so they render at
// 8 × (width / 490). Below this the labels fall under ~6.5px and the plate
// crops instead. Measured off the element, not the viewport — the plate's own
// width doesn't track viewport width (it is capped when stacked, and shrinks
// again on short laptops).
const COMPACT_WIDTH = 420;

const STATION_X = Array.from({ length: WEEKS }, (_, i) => COL_X0 + i * COL_W);
const DECK_LINE_Y = [1, 2, 3, 4].map((i) => 118 + i * 22);
const RAIL_X = [68, 78, 88, 98, 108];
const HATCH_X = Array.from({ length: 51 }, (_, i) => 24 + i * 9);
const FUNNEL_CX = [236, 300];
const FUNNEL_HATCH_Y = [46, 49.5, 53, 56.5];

const DIM_X1 = COL_X0 - 8;
const DIM_X2 = COL_X0 + (WEEKS - 1) * COL_W + 8;
const DIM_MID = (DIM_X1 + DIM_X2) / 2;

function toIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Lay the flat day list out into 13 week-columns ending with the current,
// still-unfinished week, so the grid always includes today. Days later this
// week have not happened yet and render as unlit "not yet" windows.
//
// Columns start on Monday to match the row order above — on a Sunday-start
// week the SU porthole would hold the Sunday *before* its own column's Monday,
// six days out of order and sitting below days that haven't happened yet.
function toGrid(days) {
  const byDate = new Map(days.map((day) => [day.date, day]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sinceMonday = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - sinceMonday - (WEEKS - 1) * ROWS);

  const cells = [];
  for (let i = 0; i < CELLS; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const iso = toIsoDate(date);
    const day = byDate.get(iso);

    cells.push({
      iso,
      col: Math.floor(i / ROWS),
      row: DOW_ROW[date.getDay()],
      count: day?.count ?? 0,
      level: day?.level ?? 0,
      future: date > today
    });
  }
  return cells;
}

const ContributionShip = ({ vesselName }) => {
  const { days, loading, error } = useGithubContributions();
  const plateRef = useRef(null);
  const [compact, setCompact] = useState(false);

  // Measured before paint, so a narrow plate never shows a frame of the
  // uncropped drawing with sub-legible annotations before it crops.
  useLayoutEffect(() => {
    const node = plateRef.current;
    if (!node) return undefined;

    setCompact(node.getBoundingClientRect().width < COMPACT_WIDTH);

    const observer = new ResizeObserver(([entry]) => {
      setCompact(entry.contentRect.width < COMPACT_WIDTH);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const cells = useMemo(() => toGrid(days), [days]);
  const total = useMemo(() => cells.reduce((sum, cell) => sum + cell.count, 0), [cells]);

  // The hero never interrupts on a failed fetch — the plate simply draws
  // unlit. The Now section surfaces the error where the detail lives.
  const hasData = !loading && !error;
  const plotted = toIsoDate(new Date());
  // Cropped plates lose the dimension callout, so the span moves into the
  // caption — otherwise this reads as an unqualified total next to the
  // year-long one in §02 Now.
  const complement = hasData
    ? `${total.toLocaleString()} ${ship.labels.contributions}${
        compact ? ` · ${WEEKS} ${ship.labels.weeks}` : ''
      }`
    : ship.labels.empty;

  return (
    <figure
      ref={plateRef}
      className={['cs-plate', compact ? 'cs-plate--compact' : '', hasData ? 'cs-plate--lit' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <svg
        className="cs-svg"
        viewBox={compact ? VIEWBOX_COMPACT : VIEWBOX_FULL}
        role="img"
        aria-label={
          hasData
            ? `${total} GitHub contributions over the last ${WEEKS} weeks, drawn as lit windows on a ship`
            : `GitHub contributions for the last ${WEEKS} weeks`
        }
      >
        {/* station lines — one per week, drawn first so the vessel sits on them */}
        <g className="cs-anno">
          {STATION_X.map((x) => (
            <line key={`station-${x}`} className="cs-ink-faint cs-station" x1={x} y1="76" x2={x} y2="308" />
          ))}
          {STATION_X.map((x, i) => (
            <text key={`stn-label-${x}`} className="cs-label" x={x} y="320" textAnchor="middle">
              {String(i + 1).padStart(2, '0')}
            </text>
          ))}
        </g>

        {/* hull */}
        <path className="cs-ink" d={HULL_D} strokeWidth="1.5" />
        <path className="cs-ink-thin" d="M56 258 C110 285 150 292 200 292 L410 292" strokeWidth="0.8" />
        <line className="cs-ink-thin" x1="150" y1="237" x2="436" y2="237" strokeWidth="0.8" />

        {/* superstructure: five decks, one per weekday row */}
        <rect className="cs-ink" x="112" y="118" width="296" height="112" strokeWidth="1.5" />
        {DECK_LINE_Y.map((y) => (
          <line key={`deck-${y}`} className="cs-ink-thin" x1="112" y1={y} x2="408" y2={y} strokeWidth="0.9" />
        ))}

        {/* bridge and wheelhouse */}
        <rect className="cs-ink" x="186" y="95" width="150" height="23" strokeWidth="1.5" />
        <line className="cs-ink-thin" x1="200" y1="106" x2="322" y2="106" strokeWidth="2.6" />

        {/* funnels */}
        {FUNNEL_CX.map((cx) => (
          <g key={`funnel-${cx}`}>
            <rect className="cs-ink" x={cx - 18} y="42" width="36" height="53" rx="4" strokeWidth="1.5" />
            <line className="cs-ink-thin" x1={cx - 18} y1="59" x2={cx + 18} y2="59" strokeWidth="0.9" />
            {FUNNEL_HATCH_Y.map((y) => (
              <line
                key={`funnel-hatch-${cx}-${y}`}
                className="cs-ink-faint"
                x1={cx - 17}
                y1={y}
                x2={cx + 17}
                y2={y}
                strokeWidth="0.6"
              />
            ))}
          </g>
        ))}

        {/* forecastle rail, mast and pennant */}
        <g className="cs-ink-thin" strokeWidth="0.9">
          <line x1="66" y1="216" x2="112" y2="216" />
          {RAIL_X.map((x) => (
            <line key={`rail-${x}`} x1={x} y1="216" x2={x} y2="228" />
          ))}
        </g>
        <line className="cs-ink" x1="96" y1="216" x2="96" y2="164" strokeWidth="1.2" />
        <path className="cs-ink" d="M97 166 L122 173 L97 180 Z" strokeWidth="1.2" />

        {/* waterline */}
        <line className="cs-ink" x1="20" y1="292" x2="476" y2="292" strokeWidth="1.2" />
        <g className="cs-anno">
          {HATCH_X.map((x) => (
            <line key={`hatch-${x}`} className="cs-ink-faint" x1={x} y1="299" x2={x + 6} y2="293" strokeWidth="0.7" />
          ))}
          <text className="cs-label" x="20" y="288">
            {ship.labels.waterline}
          </text>
        </g>

        {/* row letters in the starboard margin */}
        <g className="cs-anno">
          {ship.rowLetters.map((letter, row) => {
            const cy = row < DECK_ROWS ? DECK_CY[row] : PORT_CY[row - DECK_ROWS];
            return (
              <g key={`row-${row}`}>
                <line className="cs-ink-faint" x1="440" y1={cy} x2="456" y2={cy} strokeWidth="0.7" />
                <text className="cs-label-b" x="462" y={cy + 3}>
                  {letter}
                </text>
              </g>
            );
          })}
        </g>

        {/* dimension callout */}
        <g className="cs-anno">
          <line className="cs-ink-thin" x1={DIM_X1} y1="336" x2={DIM_X2} y2="336" strokeWidth="0.9" />
          <line className="cs-ink-thin" x1={DIM_X1} y1="331" x2={DIM_X1} y2="341" strokeWidth="0.9" />
          <line className="cs-ink-thin" x1={DIM_X2} y1="331" x2={DIM_X2} y2="341" strokeWidth="0.9" />
          <rect className="cs-knock" x={DIM_MID - 66} y="329" width="132" height="14" />
          <text className="cs-label-b" x={DIM_MID} y="339.5" textAnchor="middle">
            {`${WEEKS} WEEKS · ${CELLS} DAYS`}
          </text>
        </g>

        {/* the data */}
        <g className="cs-cells">
          {cells.map((cell) => {
            const cx = COL_X0 + cell.col * COL_W;
            const isPorthole = cell.row >= DECK_ROWS;
            const cy = isPorthole ? PORT_CY[cell.row - DECK_ROWS] : DECK_CY[cell.row];
            const className = ['cs-cell', `lvl-${cell.level}`, cell.future ? 'cs-cell--future' : '']
              .filter(Boolean)
              .join(' ');
            const style = { '--cs-col': cell.col };
            const label = cell.future
              ? `${cell.iso} — ${ship.messages.future}`
              : `${cell.count} contribution${cell.count === 1 ? '' : 's'} on ${cell.iso}`;

            return isPorthole ? (
              <circle key={cell.iso} className={className} style={style} cx={cx} cy={cy} r="4.6">
                <title>{label}</title>
              </circle>
            ) : (
              <rect
                key={cell.iso}
                className={className}
                style={style}
                x={cx - 6.5}
                y={cy - 4.5}
                width="13"
                height="9"
              >
                <title>{label}</title>
              </rect>
            );
          })}
        </g>
      </svg>

      <figcaption>
        <dl className="cs-titleblock">
          <div className="cs-tb-cell">
            <dt>{ship.labels.vessel}</dt>
            <dd>{vesselName}</dd>
          </div>
          <div className="cs-tb-cell">
            <dt>{ship.labels.complement}</dt>
            <dd>{complement}</dd>
          </div>
          <div className="cs-tb-cell">
            <dt>{ship.labels.plotted}</dt>
            <dd>
              <time dateTime={plotted}>{plotted}</time>
            </dd>
          </div>
          <div className="cs-tb-cell">
            <dt>{ship.labels.register}</dt>
            <dd>
              <a
                href={githubData.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${githubData.handle} on GitHub`}
              >
                {githubData.handle}
              </a>
            </dd>
          </div>
        </dl>
      </figcaption>
    </figure>
  );
};

export default ContributionShip;
