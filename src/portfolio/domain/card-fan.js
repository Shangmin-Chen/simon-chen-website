const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// `height` is the actual fan viewport used to place cards. `usableHeight` is
// the stable outer-deck capacity budget after reserving controls and the hint.
export function cardFanLayout(width, height, hasVisual = false, itemCount = Infinity, usableHeight = height, anchor = 'side') {
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);
  const availableHeight = Math.max(0, usableHeight);
  let count = Math.min(availableHeight, safeHeight) < 205 ? 1 : safeWidth >= 740 ? 5 : safeWidth >= 520 ? 3 : safeWidth >= 260 ? 2 : 1;
  count = Math.max(1, Math.min(count, itemCount));

  const overlap = count >= 5 ? 0.82 : count === 3 ? 0.76 : count === 2 ? 0.82 : 0;
  const maxWidth = count >= 5 ? 200 : count === 3 ? 215 : count === 2 ? 210 : 220;
  const horizontalScale = 1 + (count - 1) * overlap;
  let cardWidth = Math.max(0, Math.min(maxWidth, (safeWidth - 8) / horizontalScale));
  const angleFor = index => {
    const t = count === 1 ? 0 : (index / (count - 1)) * 2 - 1;
    return t * (count >= 5 ? 12 : count === 3 ? 10 : count === 2 ? 8 : 0);
  };
  const extra = (angle, axis, width, height) => {
    const radians = Math.abs(angle) * Math.PI / 180;
    const rotatedExtent = axis === 'x'
      ? Math.abs(Math.cos(radians)) * width + Math.abs(Math.sin(radians)) * height
      : Math.abs(Math.cos(radians)) * height + Math.abs(Math.sin(radians)) * width;
    return Math.max(0, (rotatedExtent - (axis === 'x' ? width : height)) / 2);
  };
  let cardHeight = Math.min(hasVisual ? clamp(cardWidth * 1.22, 205, 280) : clamp(cardWidth * 1.28, 220, 296), Math.max(0, safeHeight - 16));
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const edgeExtra = extra(angleFor(0), 'x', cardWidth, cardHeight) + extra(angleFor(count - 1), 'x', cardWidth, cardHeight);
    const occupiedWidth = cardWidth + cardWidth * overlap * (count - 1);
    const verticalExtra = Math.max(...Array.from({ length: count }, (_, index) => extra(angleFor(index), 'y', cardWidth, cardHeight)));
    const scale = Math.min(1,
      Math.max(0, safeWidth - 8 - edgeExtra) / Math.max(1, occupiedWidth),
      Math.max(0, safeHeight - 8) / Math.max(1, cardHeight + verticalExtra * 2));
    if (scale >= 0.999) break;
    cardWidth *= scale;
    cardHeight *= scale;
  }
  const step = cardWidth * overlap;
  const firstExtraX = extra(angleFor(0), 'x', cardWidth, cardHeight);
  const lastExtraX = extra(angleFor(count - 1), 'x', cardWidth, cardHeight);
  const sideInset = Math.min(4, safeWidth / 2);
  const startX = sideInset + firstExtraX;
  const verticalExtra = Math.max(...Array.from({ length: count }, (_, index) => extra(angleFor(index), 'y', cardWidth, cardHeight)));
  const availableArc = Math.max(0, (safeHeight - cardHeight) / 2 - verticalExtra - Math.min(4, safeHeight / 2));
  const arc = Math.min(count >= 5 ? 46 : 34, availableArc);
  const upperBias = anchor === 'above' ? Math.min(80, availableArc) : 0;

  const poses = Array.from({ length: count }, (_, index) => {
    const t = count === 1 ? 0 : (index / (count - 1)) * 2 - 1;
    const angle = angleFor(index);
    const halfExtent = extra(angle, 'x', cardWidth, cardHeight);
    return {
      x: index === 0 ? startX : startX + index * step,
      y: Math.max(verticalExtra + Math.min(4, safeHeight / 2), (safeHeight - cardHeight) / 2 + arc * t * t - upperBias),
      angle,
      depth: index + 1,
      width: cardWidth,
      height: cardHeight,
      rotatedInsetX: halfExtent,
    };
  });

  // The final right edge includes the rotated corner of the last card.
  const lastPose = poses.at(-1);
  if (lastPose && lastPose.x + cardWidth + lastExtraX > safeWidth - sideInset) {
    const correction = lastPose.x + cardWidth + lastExtraX - (safeWidth - sideInset);
    poses.forEach(pose => { pose.x -= correction; });
  }

  return { count, cardWidth, cardHeight, anchor, poses };
}

function segment(from, to, kind, itemId = null) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return {
    x: from.x,
    y: from.y,
    length: Math.hypot(dx, dy),
    angle: Math.atan2(dy, dx) * 180 / Math.PI,
    kind,
    itemId,
  };
}

export function cardFanConnections(hub, ports) {
  if (!hub || !ports.length) return [];
  const minY = Math.min(...ports.map(port => port.y));
  const maxY = Math.max(...ports.map(port => port.y));
  const minX = Math.min(...ports.map(port => port.x));
  const maxX = Math.max(...ports.map(port => port.x));
  // In stacked/compact layouts the wheel sits above the cards. A horizontal
  // header bus keeps that route grouped above the fan instead of drawing a
  // long diagonal to a left-side spine.
  if (hub.x >= 0 && hub.y < minY - 10) {
    const busY = minY - 18;
    const busX = Math.max(minX, Math.min(maxX, hub.x));
    const segments = [segment(hub, { x: busX, y: busY }, 'trunk')];
    if (maxX - minX > 1) segments.push(segment({ x: minX, y: busY }, { x: maxX, y: busY }, 'bus'));
    ports.forEach(port => segments.push(segment({ x: port.x, y: busY }, port, 'branch', port.id)));
    return segments.filter(link => Number.isFinite(link.length) && link.length > 0.5);
  }
  const busX = Math.min(minX - 16, Math.max(hub.x + 14, 10));
  const busY = Math.max(minY, Math.min(maxY, hub.y));
  const segments = [segment(hub, { x: busX, y: busY }, 'trunk')];
  if (maxY - minY > 1) segments.push(segment({ x: busX, y: minY }, { x: busX, y: maxY }, 'bus'));
  ports.forEach(port => {
    segments.push(segment({ x: busX, y: port.y }, port, 'branch', port.id));
  });
  return segments.filter(link => Number.isFinite(link.length) && link.length > 0.5);
}
