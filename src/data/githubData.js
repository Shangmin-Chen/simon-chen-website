export const githubData = {
  username: 'Shangmin-Chen',
  url: 'https://github.com/Shangmin-Chen',
  handle: '@Shangmin-Chen',
  messages: {
    loading: 'Loading contributions…',
    error: 'Could not load GitHub data:'
  },
  ship: {
    // The column count lives in ContributionShip.jsx — the SVG geometry is
    // drawn for exactly 13 stations, so it isn't a data-level knob.
    // Row order top to bottom: five cabin decks, then the two porthole
    // strakes in the hull.
    rowDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    // Her particulars, in the register's own vocabulary.
    labels: {
      captain: 'Captain',
      // Labels the count rather than sitting beside it, so the number can
      // never read as an all-time total.
      window: 'Past 3 months',
      contributions: 'contributions',
      note: 'Note',
      // The dimension callout under the hull.
      span: '3 months',
      empty: '—'
    },
    messages: {
      future: 'not sailed yet'
    }
  }
};
