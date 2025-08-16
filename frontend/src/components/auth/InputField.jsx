const InputField = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="mb-4">
      {label && <label className="block mb-1 font-semibold">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-md outline-none ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default InputField;
