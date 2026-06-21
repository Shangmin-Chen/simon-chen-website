// Design-system barrel entry for /design-sync.
// The repo's components are `export default`, which `export *` does NOT
// re-export — so we re-export each as a named export here. ThemeProvider is
// included because RatingGraph reads theme via useTheme() and the preview
// provider (cfg.provider) must be a bundle export.
export { default as Button } from '../src/components/ui/Button.jsx';
export { default as Card } from '../src/components/ui/Card.jsx';
export { default as Tag } from '../src/components/ui/Tag.jsx';
export { default as FormField } from '../src/components/ui/FormField.jsx';
export { default as RatingGraph } from '../src/components/charts/RatingGraph.jsx';
export { ThemeProvider } from '../src/contexts/ThemeContext.jsx';
