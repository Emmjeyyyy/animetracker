import React, { useEffect, useState } from 'react';
import Addpage from './addpage';
import { useParams, useNavigate } from 'react-router-dom';
import JikanApiService from '../services/jikanApi';

const AnimeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
        const data = await response.json();
        setAnime(data.data);
      } catch (error) {
        console.error("Error fetching anime details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnime();
  }, [id]);

  if (loading) {
    return <div className="text-center text-gray-400">Loading anime details...</div>;
  }

  if (!anime) {
    return <div className="text-center text-red-400">Anime not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 text-white">
      {/* Back Arrow Button */}
      <button
        onClick={() => navigate('/')}
        className="mb-6 p-2 bg-[#39d353] hover:bg-green-400 rounded-full transition flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Cover Image */}
        <div className="flex-shrink-0">
          <img
            src={anime.images?.jpg?.large_image_url}
            alt={anime.title}
            className="w-64 rounded-2xl shadow-lg"
          />
          <button
            className="mt-6 w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            onClick={() => setShowAddModal(true)}
          >
            Add to My List
          </button>
          <a
            href={anime.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full block text-center bg-gray-900 hover:bg-gray-800 text-[#39d353] font-semibold py-2 px-4 rounded-lg border border-green-400 transition-colors duration-200"
          >
            View on MyAnimeList
          </a>
      {/* Add Anime Modal */}
      {showAddModal && (
        <Addpage
          anime={anime.title}
          image={anime.images?.jpg?.large_image_url}
          maxEpisodes={anime.episodes}
          isAiring={anime.status === 'Currently Airing' || anime.status === 'Finished Airing'}
          onClose={() => setShowAddModal(false)}
        />
      )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4">{anime.title}</h1>
          {anime.title_english && (
            <h2 className="text-xl text-gray-400 mb-2">({anime.title_english})</h2>
          )}
          <p className="text-gray-300 leading-relaxed mb-6">
            {anime.synopsis || "No description available."}
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <p><span className="text-gray-400">Score:</span> {anime.score || "N/A"}</p>
            <p><span className="text-gray-400">Episodes:</span> {anime.episodes || "?"}</p>
            <p><span className="text-gray-400">Status:</span> {anime.status}</p>
            <p><span className="text-gray-400">Type:</span> {anime.type}</p>
            <p><span className="text-gray-400">Duration:</span> {anime.duration}</p>
            <p><span className="text-gray-400">Aired:</span> {anime.aired?.string}</p>
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((genre) => (
                  <span 
                    key={genre.mal_id} 
                    className="px-3 py-1 bg-gray-700 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
