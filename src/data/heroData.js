const IMAGE_HOST = 'https://images.simon-chen.com';

export const heroData = {
  // The claim, and the vessel named after it — the headline names the trait,
  // the drawing below proves it.
  headline: {
    lead: 'Relentlessly',
    accent: 'Curious',
  },
  vessel: {
    lead: 'The',
    accent: 'Curiosity',
  },
  // Remarks, revealed by hovering her name: what the drawing is reading.
  shipNote:
    "Every lit window is a day of GitHub contributions. Weekdays run along the passenger decks, weekends sit in the portholes below. Hover any window to see that day's count.",
  metaLines: ['Based in NYC and SF', 'Boston University Alumni'],
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
    label: 'Most recent adventure',
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
    {
      id: 'library',
      src: `${IMAGE_HOST}/shanghai/shanghai_16-thumb.jpg`,
      blurhash: 'LLEof0_NgitR%2o#kDj[H?VtWEt7',
      alt: 'The reading room at Shanghai Public Library',
    },
    {
      id: 'tower',
      src: `${IMAGE_HOST}/shanghai/shanghai_17-thumb.jpg`,
      blurhash: 'LwEDr2bdtmo#tpoztSkDX8jsRjkC',
      alt: 'Guanghua Tower at Fudan University, Simon Chen\'s exchange school',
    },
    {
      id: 'cat',
      src: `${IMAGE_HOST}/shanghai/shanghai_05-thumb.jpg`,
      blurhash: 'L69QgQ00S6-o~U0LkC?G9Go#n}%M',
      alt: 'Potato, the dorm cat at Unijia No.5, Shanghai',
    },
  ],
};
