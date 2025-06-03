const CheckboxInput = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
  labelClassName = "",
  required = false,
}) => {
  return (
    <label className={`flex items-center cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mr-2 text-blue-600 focus:ring-blue-500"
      />
      <span
        className={`text-sm ${
          disabled ? "text-gray-400" : "text-gray-700"
        } ${labelClassName}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
    </label>
  );
};

export default CheckboxInput;
