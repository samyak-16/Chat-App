const Button = ({ label, type = 'button', onClick, disabled }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-2 rounded-md text-white font-semibold transition-colors
        ${
          disabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
        }`}
    >
      {label}
    </button>
  );
};

export default Button;
