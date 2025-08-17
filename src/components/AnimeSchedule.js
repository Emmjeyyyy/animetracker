import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import Countdown from './Countdown';
import JikanApiService from '../services/jikanApi';

// Helper function to calculate next airing date and time
const getNextAiring = (day, time) => {
  if (!day || !time) return null;

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const targetDay = weekdays.indexOf(day);
  const [hours, minutes] = time.split(':').map(Number);

  // Clone today's date for calculation
  let nextDate = new Date(today);
  nextDate.setHours(hours, minutes, 0, 0);

  // Calculate days until next airing
  let daysUntil = targetDay - today.getDay();
  if (daysUntil < 0) daysUntil += 7; // Next week
  if (daysUntil === 0 && nextDate < today) daysUntil = 7; // Already aired today

  nextDate.setDate(nextDate.getDate() + daysUntil);
  return nextDate;
};

const PAGE_SIZE = 24;

const AnimeSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const navigate = useNavigate();
  const [userWatching, setUserWatching] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [countdown, setCountdown] = useState({});

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      const newCountdown = {};

      [...schedules, ...userWatching].forEach(anime => {
        const nextAiring = getNextAiring(
          anime.broadcast?.day || schedules.find(s => s.title === anime.title)?.broadcast?.day,
          anime.broadcast?.time || schedules.find(s => s.title === anime.title)?.broadcast?.time
        );

        if (nextAiring) {
          const now = new Date();
          const diff = nextAiring - now;

          if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            newCountdown[anime.title || anime.mal_id] = { days, hours, minutes, seconds };
          }
        }
      });

      setCountdown(newCountdown);
    }, 1000);

    return () => clearInterval(timer);
  }, [schedules, userWatching]);

  useEffect(() => {
    const fetchSchedules = async (retries = 3) => {
      setLoading(true);
      setError('');

      const attemptFetch = async (attempt) => {
        try {
          const res = await fetch(`https://api.jikan.moe/v4/schedules?page=${page}`);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = await res.json();

          if (data.data && data.data.length > 0) {
            setSchedules(data.data);
            setHasNextPage(data.pagination?.has_next_page || false);
          } else {
            throw new Error('No schedule data found');
          }
        } catch (err) {
          console.log(`Attempt ${attempt} failed:`, err.message);
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // wait before retry
            return attemptFetch(attempt + 1);
          }
          setError('Failed to fetch anime schedules. Please refresh the page.');
        }
      };

      await attemptFetch(1);
      setLoading(false);
    };

    fetchSchedules();
  }, [page]);

  // Fetch user's watching anime from Firestore
  useEffect(() => {
    let retryTimeout;
    let isMounted = true;

    const fetchUserWatching = async (retryCount = 0) => {
      if (!auth.currentUser) return;
      try {
        const colRef = collection(db, auth.currentUser.uid);
        const snapshot = await getDocs(colRef);
        const watching = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data.status === 'Watching') watching.push({ id: docSnap.id, ...data });
        });
        if (isMounted) setUserWatching(watching);
      } catch (err) {
        console.error('Error fetching watching list:', err);
        if (retryCount < 3 && isMounted) {
          retryTimeout = setTimeout(() => fetchUserWatching(retryCount + 1), Math.pow(2, retryCount) * 1000);
        }
      }
    };

    fetchUserWatching();

    return () => {
      isMounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [auth.currentUser]);

  const handlePrev = () => page > 1 && setPage(page - 1);
  const handleNext = () => hasNextPage && setPage(page + 1);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-[#39d353] mb-6 text-center">Airing Anime Schedule</h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="spinner w-8 h-8 border-4 border-t-[#39d353] border-gray-600 rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-300 text-lg">Loading schedules...</span>
        </div>
      ) : error ? (
        <div className="text-center text-red-400 py-8">{error}</div>
      ) : (
        <>
          {/* Watching List */}
          {userWatching.length > 0 && (
            <>
              <h3 className="text-xl font-bold text-green-400 mb-4 text-center">Your Watching List</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {userWatching.map(anime => (
                  <div
                    key={anime.title}
                    className="bg-[#161b22] rounded-xl shadow-lg border border-green-400/40 p-4 flex flex-col cursor-pointer hover:border-green-400 transition"
                    onClick={() => navigate(`/anime/${anime.malId || anime.mal_id}`)}
                  >
                    <img src={anime.image} alt={anime.title} className="w-full h-48 object-cover rounded-lg mb-3" />
                    <h3 className="text-lg font-bold text-green-400 mb-2">{anime.title}</h3>
                    <p className="text-gray-300 text-sm mb-2">Status: Watching</p>
                    <Countdown airingDay={anime.broadcast?.day} airingTime={anime.broadcast?.time} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* General Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {schedules.map(anime => (
              <div
                key={anime.mal_id}
                className="bg-[#161b22] rounded-xl shadow-lg border border-[#39d353]/30 p-4 flex flex-col cursor-pointer hover:border-green-400 transition"
                onClick={() => navigate(`/anime/${anime.mal_id}`)}
              >
                <img src={anime.images?.jpg?.image_url} alt={anime.title} className="w-full h-48 object-cover rounded-lg mb-3" />
                <h3 className="text-lg font-bold text-green-400 mb-2">{anime.title}</h3>
                <p className="text-gray-300 text-sm mb-2">Airs: {anime.broadcast?.day || 'Unknown'} {anime.broadcast?.time || ''}</p>
                <Countdown airingDay={anime.broadcast?.day} airingTime={anime.broadcast?.time} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-green-400 font-bold">Page {page}</span>
            <button
              onClick={handleNext}
              disabled={!hasNextPage}
              className="px-4 py-2 rounded-lg bg-[#39d353] text-white border border-green-400 hover:bg-green-500 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AnimeSchedule;
