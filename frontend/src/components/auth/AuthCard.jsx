const AuthCard = ({ title, children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm  ">
      <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
      {children}
    </div>
  );
};

export default AuthCard;
