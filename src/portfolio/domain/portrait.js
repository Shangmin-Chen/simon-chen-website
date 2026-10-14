import { applyGlitchBands, applyGlitchToLines, glitchPlan } from './glitch.js';

export function inPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [a, b] = points[i];
    const [c, d] = points[j];
    if ((b > y) !== (d > y) && x < (c - a) * (y - b) / (d - b) + a) inside = !inside;
  }
  return inside;
}

export function eyeCells(portrait) {
  return portrait.eyes.map(eye => {
    const cells = [];
    for (let y = 0; y < portrait.height; y++) {
      for (let x = 0; x < portrait.width; x++) {
        if (inPolygon(x + 0.5, y + 0.5, eye.mask)) cells.push({ x, y });
      }
    }
    return cells;
  });
}

// Eye centers in source-grid coordinates. Gaze is deliberately horizontal;
// the portrait's border and title row are accounted for by the UI mapper.
export function portraitEyeCenters(portrait, gazeX = 0) {
  const shiftX = Math.round(gazeX * 1.6);
  return (portrait.eyes ?? []).map(eye => ({ x: eye.center[0] + shiftX, y: eye.center[1] }));
}

export function portraitGlitchPlan(portrait, tick, burst = false, masks = eyeCells(portrait)) {
  const plan = glitchPlan(0x504f5254, tick, { width: portrait.width, height: portrait.height, burst });
  const eyeRows = new Set(masks.flatMap(cells => cells.map(cell => cell.y)));
  const bands = plan.bands.filter(band => !Array.from({ length: band.height }, (_, i) => band.y + i).some(y => eyeRows.has(y)));
  return { ...plan, bands, active: bands.length > 0 };
}

// Every frame is derived from immutable source characters, preserving iris
// texture while moving it inside the original eyelid mask. Maine has no eyes.
function portraitBaseFrame(portrait, { gaze = { x: 0, y: 0 }, tick = 0, motion = false } = {}, masks) {
  const matrix = portrait.grid.map(row => row.map(cell => [...cell]));
  if (!motion) return matrix;
  const blink = tick % 121 >= 118;
  portrait.eyes.forEach((eye, i) => {
    const shiftX = Math.round(gaze.x * 1.6);
    const shiftY = 0;
    const [cx, cy] = eye.center;
    const inIris = (x, y) => ((x + 0.5 - cx) / eye.radius[0]) ** 2 + ((y + 0.5 - cy) / eye.radius[1]) ** 2 < 1.08;
    masks[i].forEach(({ x, y }) => {
      if (blink) {
        const closed = Math.abs(y - cy - (x - cx) * -0.12) < 0.55;
        matrix[y][x] = closed ? ['=', 20] : ['#', 25];
        return;
      }
      if (!shiftX && !shiftY) return;
      const sx = x - shiftX;
      const sy = y - shiftY;
      if (inIris(x, y)) matrix[y][x] = ['%', 21];
      if (inIris(sx, sy) && portrait.grid[sy]?.[sx] && inPolygon(sx + 0.5, sy + 0.5, eye.mask)) {
        matrix[y][x] = [...portrait.grid[sy][sx]];
      }
    });
  });
  return matrix;
}

export function portraitFrame(portrait, { gaze = { x: 0, y: 0 }, tick = 0, glitchTick = tick, motion = false, burst = false, colorForSignal } = {}, masks = eyeCells(portrait)) {
  const matrix = portraitBaseFrame(portrait, { gaze, tick, motion }, masks);
  if (!motion) return matrix;
  // Keep the iris rows stationary so tracer origins continue to point at them.
  const plan = portraitGlitchPlan(portrait, burst ? glitchTick : tick, burst, masks);
  return applyGlitchBands(matrix, plan.bands, { sampleFrame: sampleTick => portraitBaseFrame(portrait, { gaze, tick: sampleTick, motion }, masks), colorForSignal });
}

export function colorRuns(row) {
  const runs = [];
  for (const [character, color] of row) {
    const previous = runs.at(-1);
    if (previous?.color === color) previous.text += character;
    else runs.push({ color, text: character });
  }
  return runs;
}

export function introFrame(lines, tick, motion = true, suppliedPlan) {
  const sample = sampleTick => {
    const settled = Math.min(1, sampleTick / 25);
    return lines.map((line, y) => {
      return Array.from(line, (char, x) => char === ' ' || ((x * 17 + y * 11 + sampleTick * 13) % 101) / 101 < settled
        ? char : '/:#X-+'[(x + y + sampleTick) % 6]).join('');
    });
  };
  if (!motion) return lines.join('\n');
  const plan = tick < 25 ? (suppliedPlan ?? glitchPlan(0x494e5452, tick, { width: Math.max(...lines.map(line => line.length)), height: lines.length, burst: true })) : { bands: [] };
  return applyGlitchToLines(sample(tick), plan.bands, { sampleFrame: sampleTick => sample(sampleTick) }).join('\n');
}
