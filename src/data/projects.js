export const projects = [
  {
    title: 'Audio Transcription Platform',
    titleParts: { before: '', em: 'Whisperrr', after: ' — multi-language audio transcription platform' },
    description:
      'Built because I was tired of slow transcription tools. Microservices on Spring Boot + FastAPI, React frontend. Hits 4× the throughput of vanilla Whisper. Ships, runs, does the thing.',
    tags: ['Spring-Boot', 'FastAPI', 'React', 'Docker'],
    meta: { year: '2025', role: 'Solo', status: 'Live' },
    github: 'https://github.com/Shangmin-Chen/Whisperrr',
    demo: 'https://whisperrr.shangmin.me',
    blog: 'whisperrr',
  },
  {
    title: 'Crime Analytics & Forecasting Platform',
    titleParts: {
      before: 'Crime ',
      em: 'Mapper',
      after: ' — analytics & forecasting',
    },
    description:
      "ML system that forecasts crime patterns across Boston's police districts. Prophet for time-series, GeoPandas for clustering. Genuinely interesting problem — crime data has strong seasonality and you can see it clearly in the graphs.",
    tags: ['Python', 'Prophet', 'GeoPandas', 'FastAPI'],
    meta: { year: '2026', role: 'ML engineer', status: 'Open source' },
    github: 'https://github.com/shangmin-chen/CrimeMapper-Boston',
    demo: 'https://crime-mapper.shangmin.me',
    blog: 'crime-mapper-boston',
  },
  {
    title: 'Spark Bytes: Food Waste Reduction Platform',
    titleParts: {
      before: 'Spark ',
      em: 'Bytes',
      after: ' — food waste reduction',
    },
    description:
      'Web platform connecting students with leftover food from campus events. Fought food waste, helped food-insecure students, and proved that unsexy-sounding projects can actually matter. Still live on campus.',
    tags: ['Django', 'Auth0', 'Google Maps', 'Python'],
    meta: { year: '2026', role: 'Full-stack', status: 'Live' },
    github: 'https://github.com/Shangmin-Chen/Spark-Bytes',
    demo: 'https://spark-bytes.shangmin.me',
    blog: 'spark-bytes',
  },
];
