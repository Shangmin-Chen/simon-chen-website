import { Tag } from 'simon-chen-website';

// Tags label skills (About.jsx) and tech stacks (BlogPost.jsx); rating/verdict
// variants color themselves via the `color` prop (currentColor border).

export const Skills = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxWidth: 460 }}>
    <Tag variant="skill">React</Tag>
    <Tag variant="skill">JavaScript</Tag>
    <Tag variant="skill">Python</Tag>
    <Tag variant="skill">Machine Learning</Tag>
    <Tag variant="skill">Rust</Tag>
  </div>
);

export const Tech = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxWidth: 460 }}>
    <Tag variant="tech">Node.js</Tag>
    <Tag variant="tech">PostgreSQL</Tag>
    <Tag variant="tech">Docker</Tag>
    <Tag variant="tech">AWS</Tag>
  </div>
);

export const Rating = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
    <Tag variant="rating" color="#1f8a4c">1487</Tag>
    <Tag variant="rating" color="#c8442a">1923</Tag>
  </div>
);

export const Verdict = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
    <Tag variant="verdict" color="#2d6a4f">Accepted</Tag>
    <Tag variant="verdict" color="#a83220">Wrong Answer</Tag>
  </div>
);
