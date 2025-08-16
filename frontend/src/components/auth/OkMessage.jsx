const OkMessage = ({ message }) => {
  if (!message) return null;

  return <p className="text-green-500 text-sm text-center mb-4">{message}</p>;
};

export default OkMessage;
