import { useEffect, useMemo, useRef, useState } from 'react';
import { githubData } from '../../data/githubData';
import { useResource } from '../application/useResource';
import { contributionDetail, contributionFocusTarget, contributionGlyphs, contributionWeekdays, contributionWindow } from '../domain/contributions';
import File from './File';
import ResourceState from './ResourceState';

const WINDOW_WEEKS = 26;
const MOBILE_WEEKS = 13;

export default function GithubActivity({ resource, active }) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [focusDate, setFocusDate] = useState('');
  const [mobile, setMobile] = useState(false);
  const [rangePage, setRangePage] = useState(1);
  const dayRefs = useRef(new Map());
  const result = useResource(resource, active && open);
  const contributions = useMemo(() => contributionWindow(result.data?.contributions ?? [], new Date(), WINDOW_WEEKS), [result.data]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 650px)');
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const pageSize = mobile ? MOBILE_WEEKS : WINDOW_WEEKS;
  const pageCount = Math.ceil(contributions.weeks.length / pageSize);
  const currentPage = Math.min(rangePage, pageCount - 1);
  const visibleStart = currentPage * pageSize;
  const weeks = contributions.weeks.slice(visibleStart, visibleStart + pageSize);
  const labels = contributions.monthLabels.slice(visibleStart, visibleStart + pageSize);
  const selectedDay = weeks.flat().find(day => day?.date === selectedDate) ?? null;
  const rangeStart = weeks.flat().find(Boolean)?.date ?? contributions.start;
  const visibleDays = weeks.flat().filter(Boolean);
  const rangeEnd = visibleDays.at(-1)?.date ?? contributions.end;
  const visibleTotal = visibleDays.reduce((sum, day) => sum + day.count, 0);
  const latestVisibleDay = visibleDays.at(-1) ?? null;
  const detailDay = selectedDay ?? latestVisibleDay;
  const tabStopDate = visibleDays.some(day => day.date === focusDate) ? focusDate : latestVisibleDay?.date;
  if (labels.length && !labels[0]) {
    const date = new Date(`${rangeStart}T00:00:00`);
    labels[0] = date.toLocaleString('en-US', { month: 'short' });
  }

  const moveRange = nextPage => {
    const safePage = Math.max(0, Math.min(pageCount - 1, nextPage));
    const nextWeeks = contributions.weeks.slice(safePage * pageSize, safePage * pageSize + pageSize);
    const nextDay = nextWeeks.flat().filter(Boolean).at(-1);
    setRangePage(safePage);
    setSelectedDate(nextDay?.date ?? '');
    setFocusDate(nextDay?.date ?? '');
  };

  const handleDayKeyDown = (event, day) => {
    const key = event.ctrlKey || event.metaKey ? `${event.ctrlKey ? 'Control' : 'Meta'}+${event.key}` : event.key;
    const target = contributionFocusTarget(weeks, day.date, key);
    if (!target) return;
    event.preventDefault();
    setSelectedDate(target);
    setFocusDate(target);
    dayRefs.current.get(target)?.focus();
  };

  return <File name="github-activity.log" onOpen={setOpen}>
    <section className="github-activity" aria-label="GitHub contribution activity">
      <ResourceState resource={result} loadingText="Connecting to GitHub…">
        <p className="activity-total">{visibleTotal.toLocaleString()} contributions</p>
        {pageCount > 1 && <div className="activity-range-controls" aria-label="Contribution date range">
          <button type="button" onClick={() => moveRange(currentPage - 1)} disabled={currentPage === 0} aria-label="Show older weeks">← older</button>
          <span>{currentPage + 1} / {pageCount}</span>
          <button type="button" onClick={() => moveRange(currentPage + 1)} disabled={currentPage === pageCount - 1} aria-label="Show newer weeks">newer →</button>
        </div>}
        <div className="activity-plot" data-page-anchor>
          <p className="activity-period">{rangeStart} — {rangeEnd}</p>
          <div className="activity-grid-wrap">
            <div className="activity-grid" role="group" aria-label={`Daily contributions from ${rangeStart} through ${rangeEnd}`}>
              <span className="activity-grid-corner" aria-hidden="true" />
              {weeks.map((week, index) => <span key={`month-${index}`} className="activity-month">{labels[index]}</span>)}
              {contributionWeekdays.map((weekday, row) => <div className="activity-row" key={weekday}>
                <span className="activity-weekday">{row % 2 === 0 ? weekday : ''}</span>
                {weeks.map((week, column) => {
                  const day = week[row];
                  return day ? <button
                    key={day.date}
                    type="button"
                    className={`activity-day activity-level-${day.level}`}
                    data-date={day.date}
                    title={contributionDetail(day)}
                    aria-label={contributionDetail(day)}
                    aria-pressed={selectedDate === day.date}
                    tabIndex={tabStopDate === day.date ? 0 : -1}
                    ref={node => {
                      if (node) dayRefs.current.set(day.date, node);
                      else dayRefs.current.delete(day.date);
                    }}
                    onFocus={() => { setFocusDate(day.date); setSelectedDate(day.date); }}
                    onKeyDown={event => handleDayKeyDown(event, day)}
                    onClick={() => { setSelectedDate(day.date); setFocusDate(day.date); }}
                  >{contributionGlyphs[day.level]}</button> : <span className="activity-day activity-future" key={`future-${column}-${row}`} aria-hidden="true"> </span>;
                })}
              </div>)}
            </div>
          </div>
          <div className="activity-footer">
            <span className="activity-detail" aria-live="polite">{contributionDetail(detailDay)}</span>
            <span className="activity-legend" aria-label="Contribution intensity">
              <span>less</span>{contributionGlyphs.map((glyph, level) => <span key={level} className={`activity-level-${level}`} aria-label={`${level} intensity`}>{glyph}</span>)}<span>more</span>
            </span>
          </div>
        </div>
        <p className="activity-source">Live GitHub feed · 1h cache</p>
        <a className="inline-link" href={githubData.url} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
      </ResourceState>
    </section>
  </File>;
}
