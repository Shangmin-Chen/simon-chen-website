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

// Every frame is derived from immutable source characters, preserving iris
// texture while moving it inside the original eyelid mask. Maine has no eyes.
export function portraitFrame(portrait, { gaze = { x: 0, y: 0 }, tick = 0, motion = false, burst = false } = {}, masks = eyeCells(portrait)) {
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
  if (burst || tick % 104 < 1) {
    const row = burst ? tick * 7 % portrait.height : 12;
    for (const y of [row, Math.min(row + 1, portrait.height - 1)]) {
      const line = matrix[y];
      matrix[y] = Array.from({ length: portrait.width }, (_, x) => {
        const cell = line[(x + (burst ? 3 : 2)) % portrait.width];
        return (x + tick) % 9 === 0 && cell[0] !== ' ' ? ['/X#:'[(x + tick) % 4], 22] : [...cell];
      });
    }
  }
  return matrix;
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

export function introFrame(lines, tick) {
  const settled = Math.min(1, tick / 25);
  return lines.map((line, y) => {
    let current = Array.from(line, (char, x) => char === ' ' || ((x * 17 + y * 11 + tick * 13) % 101) / 101 < settled
      ? char : '/:#X-+'[(x + y + tick) % 6]).join('');
    if (tick < 18 && y % 9 >= 6 && tick % 7 < 2) current = '   ' + current.slice(0, -3);
    return current;
  }).join('\n');
}
