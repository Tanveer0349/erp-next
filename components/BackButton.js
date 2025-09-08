import React from 'react';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ 
  onClick, 
  className = '', 
  size = 20,
  variant = 'default' 
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior: go back in browser history
      window.history.back();
    }
  };

  const baseClasses = "fixed top-4 left-4 z-50 p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    default: "bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg hover:shadow-xl focus:ring-gray-300",
    dark: "bg-gray-800/90 hover:bg-gray-800 text-white hover:text-gray-100 shadow-lg hover:shadow-xl focus:ring-gray-500",
    ghost: "bg-transparent hover:bg-white/20 text-gray-700 hover:text-gray-900 backdrop-blur-sm focus:ring-gray-300",
    primary: "bg-blue-600/90 hover:bg-blue-600 text-white hover:text-blue-50 shadow-lg hover:shadow-xl focus:ring-blue-300"
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      aria-label="Go back"
      type="button"
    >
      <ArrowLeft size={size} />
    </button>
  );
};

export default BackButton;