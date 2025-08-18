import React from 'react';
import Modal from './Modal';

const AnimeDetailsModal = ({ isOpen, onClose, anime }) => {
  if (!isOpen || !anime) return null;

  const title = anime.title || anime.title_english || anime?.titles?.[0]?.title || 'Untitled';
  const image = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const score = anime.score ?? 'N/A';
  const episodes = anime.episodes ?? 'N/A';
  const status = anime.status ?? 'N/A';
  const type = anime.type ?? 'N/A';
  const duration = anime.duration ?? 'N/A';
  const genres = Array.isArray(anime.genres) ? anime.genres : [];
  const synopsis = anime.synopsis || 'No synopsis available.';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative w-full max-w-4xl bg-[#0f131a] text-white rounded-2xl shadow-2xl border-[2px] border-[#03ac44] overflow-hidden max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-[220px,1fr] gap-6">
          {/* Cover */}
          <div className="flex md:block justify-center">
            <img
              src={image}
              alt={title}
              className="w-56 md:w-[220px] rounded-xl shadow-lg object-cover"
              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/220x310/111827/9CA3AF?text=No+Image'; }}
            />
          </div>

          {/* Details */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
            {anime.title_english && (
              <p className="text-white/60 mb-4">{anime.title_english}</p>
            )}

            <p className="text-white/80 leading-relaxed mb-6 break-words">{synopsis}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                <div className="text-white/60">Score</div>
                <div className="font-semibold">{score}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                <div className="text-white/60">Episodes</div>
                <div className="font-semibold">{episodes}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                <div className="text-white/60">Status</div>
                <div className="font-semibold">{status}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                <div className="text-white/60">Type</div>
                <div className="font-semibold">{type}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                <div className="text-white/60">Duration</div>
                <div className="font-semibold">{duration}</div>
              </div>
            </div>

            {genres.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <span key={g.mal_id || g.name} className="px-3 py-1 bg-gray-800 border border-white/10 rounded-full text-sm">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-black font-semibold border border-green-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AnimeDetailsModal;
