import { useCallback, useRef, useState } from 'react';

// A styled hover readout for grids of day cells — the contribution ship in the
// hero and the calendar in §02 Now both want one. The browser's native tooltip
// waits about a second, can't be themed, and reads as though the data isn't
// there at all.
//
// Give the returned ref to a positioned ancestor, spread the handlers onto the
// element the cells live in (pointer events bubble, so one listener covers the
// whole grid), and render the tip at `tip.x` / `tip.y`. Cells carry their text
// in `data-label`.
const useHoverLabel = (cellSelector) => {
  const frameRef = useRef(null);
  const [tip, setTip] = useState(null);

  const onPointerOver = useCallback(
    (event) => {
      const cell = event.target.closest(cellSelector);
      const frame = frameRef.current;
      if (!cell || !frame) return;

      // Measured off client rects rather than the cell's own coordinates, so
      // this works the same for SVG user units and for laid-out HTML.
      const box = cell.getBoundingClientRect();
      const bounds = frame.getBoundingClientRect();
      setTip({
        label: cell.dataset.label,
        x: box.left - bounds.left + box.width / 2,
        y: box.top - bounds.top
      });
    },
    [cellSelector]
  );

  const onPointerOut = useCallback(() => setTip(null), []);

  return { frameRef, tip, onPointerOver, onPointerOut };
};

export default useHoverLabel;
