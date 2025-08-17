import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  type = 'button',
  fullWidth = false
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
  primary: 'bg-gradient-to-r from-green-900 to-green-700 hover:from-green-800 hover:to-green-600 text-white font-bold border-2 border-green-400 shadow-lg',
    secondary: 'bg-gray-600 hover:bg-gray-500 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg',
    outline: 'border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-white',
    ghost: 'text-gray-300 hover:text-white hover:bg-gray-700/50',
    dark: 'bg-[#11141a] border border-green-500 text-green-400 hover:bg-green-500/20 hover:text-white shadow-lg'
  };

  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${widthClass}
        ${disabledClass}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button; 