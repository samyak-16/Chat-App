import { Link } from '@tanstack/react-router';

const RedirectLink = ({ text, linkText, to }) => {
  return (
    <p className="text-center text-sm text-gray-600 mt-4">
      {text}{' '}
      <Link to={to} className="text-indigo-600 font-semibold hover:underline">
        {linkText}
      </Link>
    </p>
  );
};

export default RedirectLink;
