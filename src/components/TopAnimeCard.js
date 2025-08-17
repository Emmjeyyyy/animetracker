import React from 'react';
import { Link } from 'react-router-dom';

const TopAnimeCard = ({ anime }) => {
  const { rank, title, image, id, borderColor, textColor } = anime;

  return (
    <div 
      className={`group relative overflow-hidden rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105 border-r-4 ${borderColor}`}
    >
      {/* Link now uses ID instead of title */}
      <Link 
        to={`/anime/${id}`}
        className="flex items-center space-x-3 p-3"
      >
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-base ${textColor}`}>
            {rank}
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <img 
            src={image} 
            alt={title}
            className="w-14 h-18 object-cover rounded-lg shadow-md"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/56x72/374151/9CA3AF?text=No+Image';
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm leading-tight group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2">
            {title}
          </h3>
        </div>
      </Link>
    </div>
  );
};

export default TopAnimeCard;
