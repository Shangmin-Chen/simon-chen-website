import { postsMeta } from './postsMeta';

// Lazy MDX loaders — content only downloads when a blog post is visited
const postModules = import.meta.glob('../content/posts/*.mdx');

// Map slug → lazy loader
const loaderBySlug = {};
Object.entries(postModules).forEach(([path, loader]) => {
  // Extract slug from path: '../content/posts/whisperrr.mdx' → 'whisperrr'
  const filename = path.split('/').pop().replace('.mdx', '');
  loaderBySlug[filename] = loader;
});

// Combine static metadata with lazy content loader
const posts = postsMeta
  .map((meta) => ({
    ...meta,
    loadComponent: loaderBySlug[meta.slug]
      ? () => loaderBySlug[meta.slug]().then((m) => m.default)
      : null,
  }))
  .sort((a, b) => new Date(b.date) - new Date(a.date));

// O(1) lookup by slug
const postsBySlug = {};
posts.forEach((post) => {
  if (post.slug) postsBySlug[post.slug] = post;
});

export { posts, postsBySlug };
