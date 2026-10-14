export default function File({ name, children, className = '' }) {
  return <article className={`focused-file ${className}`.trim()} aria-label={name}>
    <div className="file-body">{children}</div>
  </article>;
}
