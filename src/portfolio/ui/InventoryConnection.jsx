import { useLayoutEffect, useState } from 'react';

const pointKey = point => point ? `${point.x.toFixed(1)}:${point.y.toFixed(1)}` : '';

export default function InventoryConnection({ deckRef, layoutRef, hubRef, refreshKey }) {
  const [line, setLine] = useState(null);

  useLayoutEffect(() => {
    const measure = () => {
      const deck = deckRef.current;
      const layout = layoutRef.current;
      const hub = hubRef?.current;
      if (!deck?.isConnected || !layout?.isConnected || !hub?.isConnected || hub.closest('[hidden],[inert]')) {
        setLine(current => current ? null : current);
        return;
      }
      const deckBox = deck.getBoundingClientRect();
      const layoutBox = layout.getBoundingClientRect();
      const hubBox = hub.getBoundingClientRect();
      const from = { x: hubBox.left + hubBox.width / 2 - deckBox.left, y: hubBox.top + hubBox.height / 2 - deckBox.top };
      const relativeHub = { x: hubBox.left + hubBox.width / 2 - layoutBox.left, y: hubBox.top + hubBox.height / 2 - layoutBox.top };
      const width = layoutBox.width;
      const height = layoutBox.height;
      let port = { x: Math.max(8, Math.min(width - 8, relativeHub.x)), y: 0 };
      if (hubBox.right <= layoutBox.left) port = { x: 0, y: Math.max(8, Math.min(height - 8, relativeHub.y)) };
      else if (hubBox.left >= layoutBox.right) port = { x: width, y: Math.max(8, Math.min(height - 8, relativeHub.y)) };
      else if (hubBox.top >= layoutBox.bottom) port = { x: Math.max(8, Math.min(width - 8, relativeHub.x)), y: height };
      else if (hubBox.top >= layoutBox.top && hubBox.bottom <= layoutBox.bottom) {
        const distances = [
          { x: 0, y: relativeHub.y, distance: relativeHub.x },
          { x: width, y: relativeHub.y, distance: width - relativeHub.x },
          { x: relativeHub.x, y: 0, distance: relativeHub.y },
          { x: relativeHub.x, y: height, distance: height - relativeHub.y },
        ];
        port = distances.sort((a, b) => a.distance - b.distance)[0];
      }
      const to = { x: layoutBox.left - deckBox.left + port.x, y: layoutBox.top - deckBox.top + port.y };
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const next = { x: from.x, y: from.y, length: Math.hypot(dx, dy), angle: Math.atan2(dy, dx) * 180 / Math.PI, portX: to.x, portY: to.y };
      setLine(current => pointKey(current) === pointKey(next) && current?.length.toFixed(1) === next.length.toFixed(1) && current?.angle.toFixed(1) === next.angle.toFixed(1) && current?.portX.toFixed(1) === next.portX.toFixed(1) && current?.portY.toFixed(1) === next.portY.toFixed(1) ? current : next);
    };

    measure();
    const deck = deckRef.current;
    const layout = layoutRef.current;
    const hub = hubRef?.current;
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    [deck, layout, hub, hub?.closest('.crew-wheel')].filter(Boolean).forEach(node => observer.observe(node));
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [deckRef, layoutRef, hubRef, refreshKey]);

  if (!line || line.length < 1) return null;
  return <>
    <span className="inventory-connection" aria-hidden="true" style={{ left: `${line.x}px`, top: `${line.y}px`, width: `${line.length}px`, transform: `rotate(${line.angle}deg)`, '--inventory-link-length': `${Math.max(0, line.length - 7)}px` }} />
    <span className="inventory-root-port" aria-hidden="true" style={{ left: `${line.portX}px`, top: `${line.portY}px` }} />
  </>;
}
