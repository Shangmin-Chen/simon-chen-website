export default function ResourceState({ resource, loadingText, empty, children }) {
  if (resource.status === 'idle' || resource.status === 'loading') return <p className="terminal-note" role="status">{loadingText}</p>;
  if (resource.status === 'error') return <div role="alert"><p className="terminal-error">{resource.error}</p><button type="button" className="text-button" onClick={resource.retry}>[ retry connection ]</button></div>;
  if (empty) return <p className="terminal-note">Nothing here yet.</p>;
  return children;
}
