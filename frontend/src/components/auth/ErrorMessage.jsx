const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return <p className="text-red-500 text-sm text-center mb-4">{message}</p>;
};

export default ErrorMessage;
