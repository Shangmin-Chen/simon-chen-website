export function nameGraphemes(text) {
  if (typeof Intl.Segmenter === 'function') {
    return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map(part => part.segment);
  }
  return Array.from(text);
}

export function initialNameCycleState(entries) {
  const first = entries[0]?.text ?? '';
  return { index: 0, visible: nameGraphemes(first).length, phase: 'hold', remaining: 12 };
}

// Advances a typed/deleted name one grapheme at a time. Transitioning to the
// next entry's first grapheme avoids an empty prompt between languages.
export function advanceNameCycle(state, entries) {
  if (entries.length < 2) return initialNameCycleState(entries);
  const visibleLength = nameGraphemes(entries[state.index].text).length;
  if (state.phase === 'hold') {
    return state.remaining > 1
      ? { ...state, remaining: state.remaining - 1 }
      : { ...state, phase: 'delete', remaining: 0 };
  }
  if (state.phase === 'delete') {
    if (state.visible > 1) return { ...state, visible: state.visible - 1 };
    const index = (state.index + 1) % entries.length;
    return { index, visible: Math.min(1, nameGraphemes(entries[index].text).length), phase: 'type', remaining: 0 };
  }
  if (state.visible < visibleLength) return { ...state, visible: state.visible + 1 };
  return { ...state, phase: 'hold', remaining: 12 };
}
