import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoHomeOutline, IoStatsChartOutline, IoSettingsOutline } from 'react-icons/io5';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: IoHomeOutline },
    { path: '/analytics', label: 'Analytics', icon: IoStatsChartOutline },
    { path: '/settings', label: 'Settings', icon: IoSettingsOutline },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-indigo-600">Focus App</span>
          </div>
          
          <div className="flex space-x-4">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(path)
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-1.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 