import React from 'react';
import Button from './Button';

const MyAnimeCard = ({ 
  anime, 
  onEdit, 
  onDelete
}) => {
  const {
    id,
    title,
    status,
    epWatch,
    score,
    start,
    finish
  } = anime;

  return (
    <div className="relative bg-gradient-to-br from-[#161b22] to-gray-900 rounded-2xl shadow-2xl hover:shadow-green-500/20 overflow-hidden border-2 border-green-500 transition-all duration-300 transform hover:scale-105 flex flex-col h-full">
      <div className='overflow-hidden w-full h-48 bg-[#0d1117] flex items-center justify-center'>
        <img 
          className="w-full h-auto object-contain object-center rounded-xl border-2 border-green-700"
          src={anime.image || ''} 
          alt={title} 
        />
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-green-400 mb-4 text-center">{title}</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-green-300">Status:</span>
            <span className="text-green-400 font-semibold">{status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-300">Episodes:</span>
            <span className="text-green-400 font-semibold">{epWatch}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-300">Start Date:</span>
            <span className="text-green-400 font-semibold">{start || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-300">Finish Date:</span>
            <span className="text-green-400 font-semibold">{finish || '-'}</span>
          </div>
        </div>

        <div className="mt-auto pt-6 flex justify-end space-x-3">
          <Button
            variant="danger"
            size="sm"
            className="bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white font-bold border-2 border-red-400 shadow-lg"
            onClick={() => onDelete(id)}
          >
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-green-400 text-green-400 hover:bg-green-500 hover:text-white font-bold"
            onClick={() => onEdit(id, status, epWatch, score, start, finish)}
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyAnimeCard; 