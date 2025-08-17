import { useEffect, useMemo, useState, useRef } from 'react';
import { auth, db } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import Layout from '../components/Layout';
import AnimeCard from '../components/AnimeCard';
import TopAnimeCard from '../components/TopAnimeCard';
import Addpage from './addpage';
import SearchBar from '../components/SearchBar';
import JikanApiService from '../services/jikanApi';

const Homepage = () => {
  const [animeList, setAnimeList] = useState([]);
  const [visibleCount, setVisibleCount] = useState(18); // initial render count
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [animePage, setAnimePage] = useState(1); // track current page for fetching
  const [seasonalPage, setSeasonalPage] = useState(1);
  const [hasMoreAnime, setHasMoreAnime] = useState(true);
  const scrollRef = useRef(null);
  const [topAnimeList, setTopAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState(null);

  const [anime, setAnime] = useState('');
  const [animeImage, setAnimeImage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [cur, setCur] = useState(null);
  const [status, setStatus] = useState('');
  const [epWatch, setEpWatch] = useState(0);
  const [score, setScore] = useState(0);
  const [start, setStart] = useState('');
  const [finish, setFinish] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fetch random anime
  const fetchRandomAnime = async () => {
    try {
      const response = await fetch('https://api.jikan.moe/v4/random/anime');
      const data = await response.json();
      return JikanApiService.transformAnimeData(data.data);
    } catch (error) {
      console.error('Error fetching random anime:', error);
      return null;
    }
  };

  // Initial fetch
  const fetchAnimeData = async () => {
    setIsLoading(true);
    try {
      const [topAnime, seasonalAnime] = await Promise.all([
        JikanApiService.getTopAnime(1),
        JikanApiService.getSeasonalAnime(1)
      ]);
      
      // Fetch 12 random anime in parallel for initial load
      const randomAnimePromises = Array(16).fill().map(() => fetchRandomAnime());
      const randomAnimeResults = await Promise.all(randomAnimePromises);
      const validRandomAnime = randomAnimeResults.filter(anime => anime !== null);
      
      const transformedTopAnime = topAnime.map(JikanApiService.transformAnimeData);
      const transformedSeasonalAnime = seasonalAnime.map(JikanApiService.transformAnimeData);
      const allAnime = [...transformedTopAnime, ...transformedSeasonalAnime, ...validRandomAnime];
      const uniqueAnime = Array.from(new Map(allAnime.map(a => [a.id, a])).values());
      setAnimeList(uniqueAnime);
      setTopAnimeList(transformedSeasonalAnime.slice(0, 15));
      setAnimePage(2);
      setSeasonalPage(2);
      setHasMoreAnime(true);
    } catch (error) {
      console.error(error);
      setTopAnimeList([]);
      setAnimeList([]);
      setHasMoreAnime(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Infinite fetch more anime
  const fetchMoreAnime = async () => {
    if (!hasMoreAnime || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      // Fetch next page of top and seasonal anime, plus random anime
      const [topAnime, seasonalAnime] = await Promise.all([
        JikanApiService.getTopAnime(25, animePage),
        JikanApiService.getSeasonalAnime(seasonalPage)
      ]);
      
      // Fetch 3 random anime for variety
      const randomAnimePromises = Array(3).fill().map(() => fetchRandomAnime());
      const randomAnimeResults = await Promise.all(randomAnimePromises);
      const validRandomAnime = randomAnimeResults.filter(anime => anime !== null);

      const transformedTopAnime = topAnime.map(JikanApiService.transformAnimeData);
      const transformedSeasonalAnime = seasonalAnime.map(JikanApiService.transformAnimeData);
      const allAnime = [...transformedTopAnime, ...transformedSeasonalAnime, ...validRandomAnime];
      // Remove duplicates
      const newUniqueAnime = allAnime.filter(a => !animeList.some(b => b.id === a.id));
      if (newUniqueAnime.length === 0) {
        setHasMoreAnime(false);
      } else {
        setAnimeList(prev => [...prev, ...newUniqueAnime]);
        setAnimePage(prev => prev + 1);
        setSeasonalPage(prev => prev + 1);
      }
    } catch (error) {
      setHasMoreAnime(false);
    } finally {
      setIsFetchingMore(false);
    }
  };
  // Infinite scroll handler: fetch more anime when near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || isFetchingMore) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.body.offsetHeight;
      if (scrollY + viewportHeight >= fullHeight - 100) {
        // Near bottom, fetch more anime
        fetchMoreAnime();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, isFetchingMore, animeList, hasMoreAnime]);

  const collectionRef = useMemo(() => cur && collection(db, cur), [cur]);

  const handleAddToList = (animeObj) => {
    setAnime(animeObj.title);
    setAnimeImage(animeObj.image);
    setShowAddModal(true);
  };

  const handleAnimeSelect = (anime) => {
    setSelectedAnime(anime);
  };

  // Listen for authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) navigate('/'); // redirect if not logged in
      else setCur(user.uid);     // set current user UID
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch anime data only after user is authenticated
  useEffect(() => {
    if (cur) fetchAnimeData();
  }, [cur]);

  const addAnime = async () => {
    try {
      if (!auth.currentUser) return;
      // Find the selected anime object from animeList
      const animeObj = animeList.find(a => a.title === anime);
      const image = animeObj ? animeObj.image : (selectedAnime && selectedAnime.image) || '';
  await addDoc(collectionRef, { title: anime, status: status || 'Watching', epWatch, score, start, finish, image });
      setShowAddModal(false);
      setStatus(''); setEpWatch(0); setScore(0); setStart(''); setFinish('');
    } catch (error) {
      console.error(error);
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

  return (
    <>
      <Layout>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3">Anime Tracker</h1>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">Discover and track your favorite anime series.</p>
          <div className="flex justify-center mb-8">
            <SearchBar onAnimeSelect={handleAnimeSelect} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="spinner w-12 h-12 border-4 border-t-[#39d353] border-gray-600 rounded-full animate-spin"></div>
                <span className="ml-4 text-gray-300">Loading anime...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {animeList.map(anime => (
                  <AnimeCard 
                    key={anime.id} 
                    anime={anime} 
                    onAddToList={handleAddToList} 
                    onOpen={(anime) => setSelectedAnime(anime)} 
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

          <div className="xl:col-span-1">
            <div className="bg-[#161b22] rounded-2xl p-6 shadow-lg border border-[#39d353]/50">
              <h2 className="text-xl font-bold text-[#39d353] mb-6 text-center">Top Anime This Season</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="spinner w-8 h-8 border-4 border-t-[#39d353] border-gray-600 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-300 text-sm">Loading...</span>
                </div>
              ) : topAnimeData.length > 0 ? (
                <div className="space-y-3">
                  {topAnimeData.map(anime => <TopAnimeCard key={anime.rank} anime={anime} />)}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>No top anime available</p>
                  <button onClick={fetchAnimeData} className="mt-2 text-[#39d353] hover:text-green-400 text-sm">Retry</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedAnime && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setSelectedAnime(null)}
          >
            <div 
              className="bg-gray-900 text-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
                onClick={() => setSelectedAnime(null)}
              >
                ✕
              </button>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 md:w-64">
                  <img
                    src={selectedAnime.image}
                    alt={selectedAnime.title}
                    className="w-full rounded-2xl shadow-lg"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">{selectedAnime.title}</h2>
                  <p className="text-gray-300 mb-6">{selectedAnime.synopsis || 'No description available.'}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-4">
                    <p><span className="text-green-400">Aired:</span> {selectedAnime.dateAired || 'Unknown'}</p>
                    <p><span className="text-green-400">Episodes:</span> {selectedAnime.episodes || '?'}</p>
                    <p><span className="text-green-400">Status:</span> {selectedAnime.status || 'Unknown'}</p>
                    <p><span className="text-green-400">Type:</span> {selectedAnime.type || 'Unknown'}</p>
                    {selectedAnime.genres && selectedAnime.genres.length > 0 && (
                      <p className="col-span-2"><span className="text-green-400">Genres:</span> {selectedAnime.genres.join(', ')}</p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <button
                      onClick={() => navigate(`/anime/${selectedAnime.id}`)}
                      className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg border-2 border-green-400 shadow-lg transition-colors duration-200"
                    >
                      Go to Details Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>

      {/* Add Anime Modal */}
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
