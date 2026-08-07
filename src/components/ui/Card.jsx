import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = false,
  ...props 
}) => {
  const baseClasses = 'card';
  const variantClasses = {
    default: 'project-card',
    submission: 'submission-card',
    contest: 'contest-card',
    experience: 'experience-item',
    'glass-card': 'glass-card'
  };

  const selectedVariant = variantClasses[variant] || variantClasses.default;
  const hoverClass = hover ? 'card-hover' : '';

  const cardClass = `${baseClasses} ${selectedVariant} ${hoverClass} ${className}`.replace(/\s+/g, ' ').trim();

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
};

export default Card;
