// Static post metadata — keeps frontmatter out of MDX bundles.
// MDX content loads lazily in BlogPost only when a slug is visited.

export const postsMeta = [
  {
    title: 'Whisperrr: Multi-Language Audio Transcription Platform',
    date: '2025-12-14',
    excerpt:
      'A deep dive into building Whisperrr, a full-stack audio transcription platform powered by Faster Whisper, featuring instant results, multi-language support, and production-ready architecture.',
    readTime: '5 min read',
    category: 'AI',
    slug: 'whisperrr',
    technologies: [
      'Java Spring Boot', 'Python FastAPI', 'React', 'TypeScript',
      'Docker', 'Faster Whisper', 'Tailwind CSS', 'Uvicorn', 'Maven',
    ],
  },
  {
    title: 'Crime Mapper Boston: Crime Forecasting System',
    date: '2026-01-24',
    excerpt:
      'Building a comprehensive machine learning system for crime prediction using Facebook Prophet, featuring district-based forecasting, spatial hotspot analysis, and production-grade evaluation metrics.',
    readTime: '4 min read',
    category: 'Project',
    slug: 'crime-mapper-boston',
    technologies: [
      'Python', 'Streamlit', 'Facebook Prophet', 'Scikit-learn',
      'GeoPandas', 'Plotly', 'Folium', 'Contextily',
    ],
  },
  {
    title: 'Spark Bytes: Reducing Food Waste Through Community Connection',
    date: '2026-01-31',
    excerpt:
      'A deep dive into building Spark Bytes, a full-stack web platform connecting Boston University students with leftover food from campus events, featuring dual authentication, QR code check-ins, interactive maps, and a mission to reduce food waste.',
    readTime: '5 min read',
    category: 'Web Development',
    slug: 'spark-bytes',
    technologies: [
      'Django', 'JavaScript', 'SQLite', 'Auth0',
      'Google Maps API', 'Server-Side Rendering', 'Self-hosted Deployment',
    ],
  },
];
