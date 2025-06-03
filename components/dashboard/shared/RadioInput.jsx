import React from 'react';

const RadioInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  required = false,
  disabled = false,
  className = "",
  labelClassName = "",
  optionClassName = "",
  direction = "horizontal", 
  valueType = "string" 
}) => {
  const handleChange = (e) => {
    
    let newValue = e.target.value;
    
    if (valueType === "number") {
      newValue = parseInt(newValue);
    } else if (valueType === "auto") {
      const numValue = parseInt(newValue);
      newValue = isNaN(numValue) ? newValue : numValue;
    }
    
    onChange(newValue);
  };

  const defaultLabelClasses = "block text-sm font-semibold text-gray-700 mb-2";
  const containerClasses = direction === "horizontal" ? "flex gap-4" : "space-y-2";

  return (
    <div className={className}>
      <label className={`${defaultLabelClasses} ${labelClassName}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className={containerClasses}>
        {options.map((option) => (
          <label key={option.value} className={`flex items-center cursor-pointer ${optionClassName}`}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={handleChange}
              disabled={disabled}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RadioInput