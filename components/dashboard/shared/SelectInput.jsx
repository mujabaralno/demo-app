import React from 'react';

const SelectInput = ({ 
  label, 
  value, 
  onChange, 
  options = [],
  placeholder = "Select an option...",
  required = false,
  disabled = false,
  className = "",
  labelClassName = "",
  selectClassName = "",
  showPlaceholder = true
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const defaultLabelClasses = "block text-sm font-semibold text-gray-700 mb-2";
  const defaultSelectClasses = "w-full p-3 text-black border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all";

  return (
    <div className={className}>
      <label className={`${defaultLabelClasses} ${labelClassName}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        className={`${defaultSelectClasses} ${selectClassName} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      >
        {showPlaceholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput