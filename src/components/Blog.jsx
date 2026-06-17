import React from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../data/posts';
import Card from './ui/Card';

const Blog = () => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <section id="blog" className="section">
      <div className="container">
        <div className="section-head reveal">
          <div className="mono-label num">§ 06</div>
          <h2>
            Writing <em>— when I figured something out</em>
          </h2>
        </div>
        <div className="blog-grid">
          {posts.map((post, index) => (
            <Card key={post.slug || index} variant="blog">
              <h3 className="blog-title">{post.title}</h3>
              <div className="blog-meta">
                <span>{formatDate(post.date)}</span>
                <span>•</span>
                <span>{post.readTime}</span>
                <span>•</span>
                <span>{post.category}</span>
              </div>
              <p className="blog-excerpt">{post.excerpt}</p>
              <Link to={`/blog/${post.slug}`} className="blog-link">
                Read More
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
