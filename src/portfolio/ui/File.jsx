export default function File({ name, children, onOpen }) {
  return <details className="terminal-file" onToggle={onOpen ? event => onOpen(event.currentTarget.open) : undefined}>
    <summary>{name}</summary><div className="file-body">{children}</div>
  </details>;
}
