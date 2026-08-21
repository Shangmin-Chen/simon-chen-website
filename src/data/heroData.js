const IMAGE_HOST = 'https://images.simon-chen.com';

export const heroData = {
  // The hero's headline is the vessel the contribution plate draws. Two-tone,
  // the way "Relentlessly Curious" was.
  vessel: {
    lead: 'The',
    accent: 'Curiosity',
  },
  // Remarks, in the title block beside her name: what the drawing is reading.
  shipNote:
    'Every lit window is a day of GitHub contributions. Weekdays run along the passenger decks, weekends sit in the portholes below.',
  metaLines: ['Based in NYC', 'Boston University New Grad'],
  buttons: [
    {
      text: 'View Projects',
      variant: 'primary',
      action: 'projects',
    },
    {
      text: "Let's Chat",
      variant: 'secondary',
      action: 'contact',
    },
  ],
  album: {
    to: '/gallery/shanghai-study-abroad',
    label: 'Ports of call',
    caption: 'Shanghai Study Abroad',
  },
  // Scattered on the right, largest first — the first carries the caption
  // linking through to the album.
  photos: [
    {
      id: 'portrait',
      src: `${IMAGE_HOST}/shanghai/shanghai_08-thumb.jpg`,
      blurhash: 'LE9@L;4n00~p00?b?b9F.8M{RPo#',
      alt: 'Simon Chen on the Huangpu River ferry at night, Shanghai',
    },
    {
      id: 'river',
      src: `${IMAGE_HOST}/shanghai/shanghai_02-thumb.jpg`,
      blurhash: 'LuH{4nt7WBt7_NWBWBof-pofofay',
      alt: 'The Li River seen from the top of Ruyi Mountain, Guilin',
    },
    {
      id: 'street',
      src: `${IMAGE_HOST}/shanghai/shanghai_12-thumb.jpg`,
      blurhash: 'LpFsPrWVo2WB.TIVocj[%#V@afof',
      alt: "The factory Simon Chen's grandfather used to run, in Songjiang, Shanghai",
    },
    {
      id: 'desk',
      src: `${IMAGE_HOST}/shanghai/shanghai_18-thumb.jpg`,
      blurhash: 'LKF$2?oHIo-o.mIoR*xux[%1kCIV',
      alt: 'Simon Chen shipping code at his internship in Jingan, Shanghai',
    },
  ],
};
