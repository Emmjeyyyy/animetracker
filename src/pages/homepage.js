import { useEffect, useMemo, useState, useRef } from 'react';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import Layout from '../components/Layout';
import AnimeCard from '../components/AnimeCard';
import TopAnimeCard from '../components/TopAnimeCard';
import Addpage from './addpage';
import SearchBar from '../components/SearchBar';
import JikanApiService from '../services/jikanApi';

const Homepage = () => {
  const [animeList, setAnimeList] = useState([]);
  const [topAnimeList, setTopAnimeList] = useState([]);
  const [visibleCount, setVisibleCount] = useState(18);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [animePage, setAnimePage] = useState(1);
  const [hasMoreAnime, setHasMoreAnime] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cur, setCur] = useState(null);
  const [anime, setAnime] = useState('');
  const [animeImage, setAnimeImage] = useState('');
  const [status, setStatus] = useState('');
  const [epWatch, setEpWatch] = useState(0);
  const [score, setScore] = useState(0);
  const [start, setStart] = useState('');
  const [finish, setFinish] = useState('');
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // ---------- FETCH METHODS ----------

  // Fetch top anime this season (sidebar)
  const fetchTopAnimeThisSeason = async () => {
    const cacheKey = 'topAnimeListCacheV1';
    const ttlMs = 10 * 60 * 1000; // 10 minutes

    // Try cache first
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.ts && Date.now() - parsed.ts < ttlMs && Array.isArray(parsed.items)) {
          setTopAnimeList(parsed.items);
          return;
        }
      }
    } catch (_) {}

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const fetchWithRetries = async (url, retries = 2, delayMs = 700) => {
      let attempt = 0;
      while (attempt <= retries) {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          return Array.isArray(data?.data) ? data.data : [];
        } catch (err) {
          if (attempt === retries) return [];
          await sleep(delayMs);
          delayMs *= 2;
          attempt++;
        }
      }
      return [];
    };

    try {
      // Try seasonal first, then fallback to yearly, then all-time
      let items = await fetchWithRetries('https://api.jikan.moe/v4/seasons/now?limit=10');

      if (!items || items.length === 0) {
        const year = new Date().getFullYear();
        items = await fetchWithRetries(`https://api.jikan.moe/v4/anime?start_date=${year}-01-01&end_date=${year}-12-31&order_by=score&sort=desc&limit=10`);
      }

      if (!items || items.length === 0) {
        items = await fetchWithRetries('https://api.jikan.moe/v4/top/anime?limit=10');
      }

      const topSeasonAnime = items.map(JikanApiService.transformAnimeData);
      setTopAnimeList(topSeasonAnime);

      // Cache result
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), items: topSeasonAnime }));
      } catch (_) {}
    } catch (error) {
      console.error('Error fetching top anime this season:', error);
      setTopAnimeList([]);
    }
  };

  // Fetch 12 recommended/popular anime first
  const fetchRecommendedAnime = async () => {
    try {
      const response = await fetch('https://api.jikan.moe/v4/anime?limit=12');
      const data = await response.json();
      const recommended = data.data.map(JikanApiService.transformAnimeData);
      setAnimeList(shuffleArray(recommended)); // <-- shuffle the order here
    } catch (error) {
      console.error('Error fetching recommended anime:', error);
      setAnimeList([]);
    }
  };

  // Fetch random anime (to append after recommended)
  const fetchRandomAnime = async () => {
    try {
      const randomAnimePromises = Array(12).fill().map(async () => {
        const response = await fetch('https://api.jikan.moe/v4/random/anime');
        const data = await response.json();
        return JikanApiService.transformAnimeData(data.data);
      });
      const results = await Promise.all(randomAnimePromises);
      const uniqueResults = Array.from(new Map(results.map(a => [a.id, a])).values());
      setAnimeList(prev => [...prev, ...uniqueResults]);
      setAnimePage(2);
      setHasMoreAnime(true);
    } catch (error) {
      console.error('Error fetching random anime:', error);
      setHasMoreAnime(false);
    }
  };

  // Fetch more anime for infinite scroll
  const fetchMoreAnime = async () => {
    if (!hasMoreAnime || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const randomAnimePromises = Array(3).fill().map(async () => {
        const response = await fetch('https://api.jikan.moe/v4/random/anime');
        const data = await response.json();
        return JikanApiService.transformAnimeData(data.data);
      });
      const results = await Promise.all(randomAnimePromises);
      const newUnique = results.filter(a => !animeList.some(b => b.id === a.id));
      if (newUnique.length === 0) {
        setHasMoreAnime(false);
      } else {
        setAnimeList(prev => [...prev, ...newUnique]);
        setAnimePage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching more anime:', error);
      setHasMoreAnime(false);
    } finally {
      setIsFetchingMore(false);
    }
  };

  // ---------- AUTH ----------
  const collectionRef = useMemo(() => cur && collection(db, cur), [cur]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) navigate('/');
      else setCur(user.uid);
    });
    return () => unsubscribe();
  }, [navigate]);

  // ---------- INITIAL FETCH ----------
  useEffect(() => {
    if (cur) {
      setIsLoading(true);
      // fetch top anime and recommended in parallel
      Promise.all([fetchTopAnimeThisSeason(), fetchRecommendedAnime()])
        .finally(() => setIsLoading(false));
    }
  }, [cur]);

  // ---------- INFINITE SCROLL ----------
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || isFetchingMore) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.body.offsetHeight;
      if (scrollY + viewportHeight >= fullHeight - 100) {
        fetchMoreAnime();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, isFetchingMore, animeList, hasMoreAnime]);

  // ---------- MODAL HANDLERS ----------
  const handleAddToList = (animeObj) => {
    setAnime(animeObj.title);
    setAnimeImage(animeObj.image);
    setShowAddModal(true);
  };

  const addAnime = async () => {
    try {
      if (!auth.currentUser || !cur) return;

      const collectionRef = collection(db, cur); // <-- ensure this exists here

      const animeObj = animeList.find(a => a.title === anime);
      const image = animeObj ? animeObj.image : (selectedAnime && selectedAnime.image) || '';

      await addDoc(collectionRef, {
        title: anime,
        status: status || 'Watching',
        epWatch,
        score,
        start,
        finish,
        image
      });

      setShowAddModal(false);
      setStatus(''); setEpWatch(0); setScore(0); setStart(''); setFinish('');
    } catch (error) {
      console.error('Error adding anime:', error);
    }
  };


  const topAnimeData = topAnimeList.map((anime, index) => ({
    id: anime.id,
    rank: index + 1,
    title: anime.title,
    image: anime.image,
    link: `/anime/${anime.id}`,
    borderColor:
      index === 0 ? 'border-[#39d353]' :
      index === 1 ? 'border-green-400' :
      index === 2 ? 'border-green-300' : 'border-gray-600',
    textColor:
      index === 0 ? 'text-[#39d353]' :
      index === 1 ? 'text-green-400' :
      index === 2 ? 'text-green-300' : 'text-gray-400'
  }));

  // ---------- RENDER ----------
  return (
    <>
      <Layout>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3">Anime Tracker</h1>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Discover and track your favorite anime series.
          </p>
          <div className="flex justify-center mb-8">
            <SearchBar />
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* MAIN FEED */}
          <div className="xl:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div key={idx} className="bg-[#161b22] rounded-2xl p-4 border border-[#39d353]/20 animate-pulse">
                    <div className="w-full h-48 bg-gray-700 rounded-xl mb-4"></div>
                    <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {animeList.map(anime => (
                  <AnimeCard 
                    key={anime.id} 
                    anime={anime} 
                    onAddToList={handleAddToList} 
                    onOpen={(anime) => navigate(`/anime/${anime.id}`)} 
                  />
                ))}
                {isFetchingMore && (
                  <div className="col-span-full flex justify-center py-6">
                    <span className="text-green-400">Loading more anime...</span>
                  </div>
                )}
                {!hasMoreAnime && (
                  <div className="col-span-full flex justify-center py-6">
                    <span className="text-gray-400">No more anime to load.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* TOP ANIME SIDEBAR */}
          <div className="xl:col-span-1">
            <div className="bg-[#161b22] rounded-2xl p-6">
              <h2 className="text-[20px] font-bold text-green-400 mb-4">Top Anime This Season</h2>
              <ul className="space-y-4">
                {topAnimeData.map(anime => (
                  <TopAnimeCard key={anime.id} anime={anime} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Layout>

      {/* ADD MODAL */}
      {showAddModal && (
        <Addpage
          anime={anime}
          image={animeImage} 
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
};

export default Homepage;
