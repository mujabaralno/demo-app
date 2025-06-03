import React from "react";

const NumberInput = ({
  label,
  value,
  onChange,
  min = 1,
  max,
  step = 0.1,
  placeholder = "",
  required = false,
  disabled = false,
  className = "",
  labelClassName = "",
  inputClassName = "",
}) => {
  const handleChange = (e) => {
    const inputValue = e.target.value;

    // Handle empty input
    if (inputValue === "") {
      onChange(0);
      return;
    }

    const newValue = parseFloat(inputValue);

    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  const defaultInputClasses =
    "w-full text-black p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all";
  const defaultLabelClasses = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className={className}>
      <label className={`${defaultLabelClasses} ${labelClassName}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`${defaultInputClasses} ${inputClassName} ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
};

export default NumberInput;
