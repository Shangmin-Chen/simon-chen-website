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
  autoComplete,
  ...props 
}) => {
  const isTextarea = type === 'textarea';

  const resolvedAutoComplete =
    autoComplete ??
    (type === 'email' ? 'email' : name === 'name' ? 'name' : undefined);

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span aria-hidden="true" style={{ color: 'var(--error-color)' }}> *</span>}
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
          autoComplete={resolvedAutoComplete}
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
          autoComplete={resolvedAutoComplete}
          {...props}
        />
      )}
    </div>
  );
};

export default FormField;
