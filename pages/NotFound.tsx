
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-light dark:bg-dark flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="text-3xl font-semibold mt-4 mb-2">Page Not Found</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-primary text-white font-semibold rounded-md shadow-md hover:bg-primary-700 transition-colors"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
