import React from 'react';

const Input = ({ 
  type = 'text',
  value,
  onChange,
  placeholder = '',
  label = '',
  className = '',
  required = false,
  disabled = false,
  error = '',
  fullWidth = true,
  inputClassName = '',
  rightElement = null,
  leftElement = null,
  name,
  autoComplete,
  onKeyUp,
  onBlur,
  onFocus,
  id,
}) => {
  const baseClasses = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  const withLeftPadding = leftElement ? 'pl-10' : '';
  const withRightPadding = rightElement ? 'pr-10' : '';

  const inputId = id || (label ? `${(name || placeholder || 'input').toString().replace(/\s+/g, '-').toLowerCase()}-field` : undefined);

  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
      {leftElement && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center z-10">
          {leftElement}
        </div>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onKeyUp={onKeyUp}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`
          ${baseClasses}
          ${errorClasses}
          ${disabledClasses}
          ${withLeftPadding}
          ${withRightPadding}
          ${inputClassName}
        `}
      />

      {rightElement && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
          {rightElement}
        </div>
      )}

      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input; 