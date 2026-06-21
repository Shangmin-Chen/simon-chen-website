import { Card } from 'simon-chen-website';

// Card is a thin container — the visible style comes from its variant class
// plus editorial child markup. Compositions mirror Blog.jsx (blog) and the
// project/experience listings.

export const Blog = () => (
  <div style={{ maxWidth: 520 }}>
    <Card variant="blog">
      <h3 className="blog-title">Building Spark Bytes</h3>
      <div className="blog-meta">
        <span>Mar 14, 2025</span>
        <span>&bull;</span>
        <span>6 min read</span>
        <span>&bull;</span>
        <span>Engineering</span>
      </div>
      <p className="blog-excerpt">
        How we built a campus food-sharing app that cut event waste while
        feeding hundreds of students each week.
      </p>
      <a href="#" className="blog-link">
        Read More
      </a>
    </Card>
  </div>
);

export const Project = () => (
  <div style={{ maxWidth: 520 }}>
    <Card variant="default">
      <h3 className="blog-title">Crime Mapper Boston</h3>
      <p className="blog-excerpt">
        An interactive map visualizing Boston crime data with filtering by
        district, category, and time of day.
      </p>
    </Card>
  </div>
);

export const Experience = () => (
  <div style={{ maxWidth: 520 }}>
    <Card variant="experience">
      <h3 className="blog-title">Software Engineer Intern</h3>
      <div className="blog-meta">
        <span>Summer 2025</span>
        <span>&bull;</span>
        <span>Boston, MA</span>
      </div>
      <p className="blog-excerpt">
        Shipped data pipelines and internal tooling for a real-time analytics
        platform.
      </p>
    </Card>
  </div>
);
