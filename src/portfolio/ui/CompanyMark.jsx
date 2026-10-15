export default function CompanyMark({ company, src, className = '' }) {
  if (!src) return null;
  return <img
    className={`company-mark ${className}`.trim()}
    src={src}
    alt=""
    aria-hidden="true"
    loading="lazy"
    decoding="async"
    data-company={company}
  />;
}
