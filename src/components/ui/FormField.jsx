import React from 'react';

const FormField = ({ 
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 1,
  className = '',
  ...props 
}) => {
  const isTextarea = type === 'textarea';

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span style={{ color: 'var(--error-color)' }}> *</span>}
        </label>
      )}
      {isTextarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          {...props}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          {...props}
        />
      )}
    </div>
  );
};

export default FormField;
