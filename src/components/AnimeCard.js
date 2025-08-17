import React from 'react';
import Button from './Button';

const AnimeCard = ({ anime, onAddToList, onOpen, showAddButton = true, className = '' }) => {
  const { title, image, score } = anime;

  return (
    <div className={`group relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 hover: transform-gpu will-change-transform duration-200 ease-out hover:scale-105 ${className} flex flex-col`}>
      
      {/* Anime Cover with Blurred Background */}
      <div className="w-[207px] h-[296px] mx-auto mt-4 relative rounded-2xl overflow-hidden flex justify-center items-center">
        {/* Blurred background */}
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover blur-[5px] scale-110"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/207x296/374151/9CA3AF?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-black/50"></div>
        {/* Actual cover */}
        <img
          src={image}
          alt={title}
          className="relative z-10 w-[207px] h-[296px] object-contain rounded-xl"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/207x296/374151/9CA3AF?text=No+Image';
          }}
        />
        {/* Score Badge */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 z-20">
          <span className="text-green-400 font-bold text-sm">{score ? `${score}/10` : 'N/A'}</span>
        </div>
      </div>

      {/* Title */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{title}</h3>
      </div>

      {/* Buttons */}
      <div className="p-4 pt-0 flex flex-col gap-2 mt-auto">
        {showAddButton && (
          <Button
            onClick={() => onAddToList(anime)}
            fullWidth
            size="sm"
            variant="primary"
            className="bg-green-800 hover:bg-green-600 text-green-300 font-bold border-2 border-green-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            Add to My List
          </Button>
        )}
        <Button 
          onClick={() => onOpen(anime)}
          fullWidth
          size="sm"
          variant="dark"
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold border-2 border-gray-700 transition-all duration-300"
        >
          See Details
        </Button>
      </div>
    </div>
  );
};

export default AnimeCard;
