import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { postsBySlug } from '../data/posts';
import { MDXComponents } from './mdx/MDXComponents';
import Button from './ui/Button';
import Tag from './ui/Tag';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = postsBySlug[slug];
  const [PostContent, setPostContent] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!post?.loadComponent) return;
    post.loadComponent().then((Component) => {
      setPostContent(() => Component);
    });
  }, [post]);

  if (!post) {
    return (
      <div className="blog-post-container">
        <div className="container">
          <div className="blog-post-not-found">
            <h1>Post Not Found</h1>
            <p>The blog post you're looking for doesn't exist.</p>
            <Button variant="primary" onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="blog-post-container">
      <div className="container">
        <article className="blog-post">
          <header className="blog-post-header">
            <h1 className="blog-post-title">{post.title}</h1>
            <div className="blog-post-meta">
              <span>{formatDate(post.date)}</span>
              <span>•</span>
              <span>{post.readTime}</span>
              <span>•</span>
              <span>{post.category}</span>
            </div>
            {post.technologies && post.technologies.length > 0 && (
              <div className="blog-post-technologies">
                {post.technologies.map((tech, techIndex) => (
                  <Tag key={techIndex} variant="tech">{tech}</Tag>
                ))}
              </div>
            )}
          </header>

          <div className="blog-post-content">
            {PostContent ? (
              <MDXProvider components={MDXComponents}>
                <PostContent />
              </MDXProvider>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
            )}
          </div>

          <footer className="blog-post-footer">
            <Button variant="secondary" onClick={() => navigate('/')}>← Back to Home</Button>
          </footer>
        </article>
      </div>
    </div>
  );
};

export default BlogPost;
