import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AnimeCard from '../components/AnimeCard';
import AnimeDetailsModal from '../components/AnimeDetailsModal';
import Button from '../components/Button';
import Layout from '../components/Layout';
import Addpage from './addpage'; 
// Transform Jikan API anime object into the shape AnimeCard expects
const transformAnimeData = (anime) => {
  if (!anime) return null;
  return {
    id: anime.mal_id,
    title: anime.title || 'Unknown',
    image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
    score: anime.score || 'N/A',
  };
};
const RandomPage = () => {
  const [items, setItems] = useState([]); // transformed for cards
  const [rawById, setRawById] = useState({}); // raw map for modal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null); // raw anime object
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mounted = useRef(false); // fix double fetch in Strict Mode
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [curAnime, setCurAnime] = useState({ title: '', image: '' });
  const fetchFiveRandom = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const promises = Array.from({ length: 5 }, async () => {
        const res = await fetch('https://api.jikan.moe/v4/random/anime');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return json.data;
      });
      const results = await Promise.all(promises);
      // de-duplicate by mal_id
      const uniq = [];
      const seen = new Set();
      for (const a of results) {
        if (a && !seen.has(a.mal_id)) {
          seen.add(a.mal_id);
          uniq.push(a);
        }
      }
      const mapped = uniq.map(transformAnimeData).filter(Boolean);
      const mapById = Object.fromEntries(uniq.map(a => [a.mal_id, a]));
      setItems(mapped);
      setRawById(mapById);
    } catch (err) {
      console.error('Error fetching random anime:', err);
      setError('Failed to fetch random anime. Please try again.');
      setItems([]);
      setRawById({});
    } finally {
      setLoading(false);
    }
  }, []);
  // Only run on first mount, avoids double fetch in Strict Mode
  useEffect(() => {
    if (!mounted.current) {
      fetchFiveRandom();
      mounted.current = true;
    }
  }, [fetchFiveRandom]);

  // Hide page scrollbar while on RandomPage
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflowY;
    const prevHtmlOverflow = document.documentElement.style.overflowY;
    document.body.style.overflowY = 'hidden';
    document.documentElement.style.overflowY = 'hidden';
    return () => {
      document.body.style.overflowY = prevBodyOverflow;
      document.documentElement.style.overflowY = prevHtmlOverflow;
    };
  }, []);
  const handleOpen = (anime) => {
    const raw = rawById[anime?.id];
    setSelected(raw || null);
    setIsModalOpen(!!raw);
  };
  const handleClose = () => {
    setIsModalOpen(false);
    setSelected(null);
  };
  const handleAddToList = useCallback((anime) => {
    setCurAnime({ title: anime.title, image: anime.image });
    setShowAddModal(true);
  }, []);
  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="spinner w-12 h-12 border-4 border-t-[#39d353] border-gray-600 rounded-full animate-spin"></div>
          <span className="mt-4 text-gray-300">Loading random anime...</span>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchFiveRandom} variant="primary">Try Again</Button>
        </div>
      );
    }
    if (!items.length) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-300">
          No anime found. <Button className="ml-3" onClick={fetchFiveRandom}>Retry</Button>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 auto-rows-fr">
        {items.map(anime => (
          <AnimeCard
            key={anime.id}
            anime={anime}
            onAddToList={handleAddToList} // ADD MODAL TRIGGER
            onOpen={handleOpen}
            showAddButton={true}
          />
        ))}
      </div>
    );
  }, [loading, error, items, fetchFiveRandom, handleAddToList]);
  return (
    <>
      <Layout className="overflow-hidden">
      <div className="flex justify-between mb-6">
        
      <div >
        <h1 className="text-3xl md:text-4xl font-bold text-white">Random Anime</h1>
      </div>
        <Button 
          onClick={fetchFiveRandom}
          variant="primary"
          size="md"
          disabled={loading}
          className="border-2 border-green-400"
        >
          {loading ? 'Loading...' : 'Refresh Anime'}
        </Button>
      </div>
      {content}
      <AnimeDetailsModal isOpen={isModalOpen} onClose={handleClose} anime={selected} />

          </Layout>

    {showAddModal && (
      <Addpage
        anime={curAnime.title}
        image={curAnime.image}
        onClose={() => setShowAddModal(false)}
      />
    )}
    </>
  );
};
export default RandomPage;