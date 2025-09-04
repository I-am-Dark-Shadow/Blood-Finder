import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-6xl font-bold text-rose-600">404</h1>
      <p className="text-xl text-slate-700 mt-4">Page Not Found</p>
      <Link to="/" className="mt-6 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition">
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;