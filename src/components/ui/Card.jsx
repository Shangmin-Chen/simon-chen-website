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
    experience: 'experience-item'
  };

  const cardClass = `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className}`.trim();

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
};

export default Card;
