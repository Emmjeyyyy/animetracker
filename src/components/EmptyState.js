import React from 'react';

const EmptyState = ({ 
  title = "No items found", 
  description = "Start by adding some items to see them here.",
  icon,
  action 
}) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] text-center">
      {icon && (
        <div className="mb-6 text-gray-400">
          {icon}
        </div>
      )}
      
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
        {title}
      </h3>
      
      <p className="text-gray-400 text-lg max-w-md mx-auto mb-8">
        {description}
      </p>
      
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState; 