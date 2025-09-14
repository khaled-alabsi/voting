import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChartBarIcon, PlusIcon, HomeIcon } from '@heroicons/react/24/outline';

function Header() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">VotingApp</span>
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <HomeIcon className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/create"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/create') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create Pool</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;