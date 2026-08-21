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
    rowLetters: ['M', 'T', 'W', 'T', 'F', 'SA', 'SU'],
    // Her particulars, in the register's own vocabulary.
    labels: {
      length: 'Length o.a.',
      complement: 'Complement',
      master: 'Master',
      plotted: 'Plotted',
      waterline: 'L.W.L.',
      contributions: 'contributions',
      weeks: 'weeks',
      days: 'days',
      empty: '—'
    },
    messages: {
      future: 'not sailed yet'
    }
  }
};
