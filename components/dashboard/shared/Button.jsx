
import React from 'react';

const Button = ({ 
  children,
  onClick,
  type = "button",
  variant = "primary", 
  size = "medium", 
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
  ...props
}) => {
  
  const baseClasses = "font-bold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Size variants
  const sizeClasses = {
    small: "py-2 px-4 text-sm",
    medium: "py-4 px-6 text-lg", 
    large: "py-5 px-8 text-xl"
  };
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:shadow-2xl hover:-translate-y-1 focus:ring-blue-300",
    secondary: "bg-gradient-to-r from-gray-600 to-gray-800 text-white hover:shadow-2xl hover:-translate-y-1 focus:ring-gray-300", 
    success: "bg-gradient-to-r from-green-600 to-green-800 text-white hover:shadow-2xl hover:-translate-y-1 focus:ring-green-300",
    danger: "bg-gradient-to-r from-red-600 to-red-800 text-white hover:shadow-2xl hover:-translate-y-1 focus:ring-red-300",
    outline: "border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white hover:shadow-lg focus:ring-blue-300"
  };
  
  // Width classes
  const widthClasses = fullWidth ? "w-full" : "";
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses} 
    ${sizeClasses[size]} 
    ${variantClasses[variant]} 
    ${widthClasses} 
    ${disabled ? 'hover:transform-none hover:shadow-none' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};