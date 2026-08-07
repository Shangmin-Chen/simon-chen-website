import React from 'react';

const Tag = ({ 
  children, 
  variant = 'default',
  className = '',
  color,
  ...props 
}) => {
  const baseClasses = 'tag';
  const variantClasses = {
    default: '',
    skill: 'skill-tag',
    tech: 'tech-tag',
    rating: 'problem-rating',
    verdict: 'verdict'
  };

  const selectedVariant = variantClasses[variant] !== undefined ? variantClasses[variant] : variantClasses.default;
  const tagClass = `${baseClasses} ${selectedVariant} ${className}`.replace(/\s+/g, ' ').trim();

  const style = color ? { color, borderColor: color } : {};

  return (
    <span className={tagClass} style={style} {...props}>
      {children}
    </span>
  );
};

export default Tag;
