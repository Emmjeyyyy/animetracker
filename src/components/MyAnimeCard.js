import React, { useEffect, useState } from 'react';
import Button from './Button';
import Countdown from './Countdown';
import { auth, db } from '../firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';

// lightweight broadcast cache to avoid hitting Jikan rate limits per card
const broadcastCache = new Map();
try {
  const stored = JSON.parse(sessionStorage.getItem('broadcastCacheV1') || '{}');
  if (stored && typeof stored === 'object') {
    Object.entries(stored).forEach(([k, v]) => broadcastCache.set(k, v));
  }
} catch (_) {}
const persistCache = () => {
  try {
    const obj = Object.fromEntries(broadcastCache.entries());
    sessionStorage.setItem('broadcastCacheV1', JSON.stringify(obj));
  } catch (_) {}
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fetchJsonRetry = async (url, retries = 2, delay = 700) => {
  try {
    const res = await fetch(url);
    if (res.status === 429) throw new Error('rate');
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } catch (e) {
    if (retries <= 0) throw e;
    await sleep(delay);
    return fetchJsonRetry(url, retries - 1, Math.min(3000, delay * 1.7));
  }
};

const MyAnimeCard = ({ 
  anime, 
  onEdit
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

  const [epCount, setEpCount] = useState(epWatch || 0);
  const [broadcast, setBroadcast] = useState({ day: null, time: null, tz: 'Asia/Tokyo' });
  const [incLoading, setIncLoading] = useState(false);

  useEffect(() => setEpCount(epWatch || 0), [epWatch]);

  useEffect(() => {
    let ignore = false;
    const fetchBroadcast = async () => {
      if ((status || '').toLowerCase() !== 'watching' || !title) return;
      const key = title.toLowerCase().trim();
      const cached = broadcastCache.get(key);
      if (cached && cached.day && cached.time) {
        if (!ignore) setBroadcast(cached);
        return;
      }
      try {
        // jitter to avoid burst
        await sleep(200 + Math.random() * 400);
        // 1) Search by title to get a reliable MAL ID
        const sJson = await fetchJsonRetry(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=5`);
        const list = Array.isArray(sJson?.data) ? sJson.data : [];
        if (list.length === 0) return;
        const lower = title.toLowerCase();
        const best = list.find(
          a => (a.title || '').toLowerCase() === lower || (a.title_english || '').toLowerCase() === lower
        ) || list[0];
        if (!best?.mal_id) return;
        // 2) Fetch full details to ensure broadcast fields
        const fJson = await fetchJsonRetry(`https://api.jikan.moe/v4/anime/${best.mal_id}/full`);
        const full = fJson?.data || {};
        const day = full?.broadcast?.day || best?.broadcast?.day || null;
        const time = full?.broadcast?.time || best?.broadcast?.time || null;
        const tz = full?.broadcast?.timezone || 'Asia/Tokyo';
        const payload = { day, time, tz };
        broadcastCache.set(key, payload);
        persistCache();
        if (!ignore) setBroadcast(payload);
      } catch (_) {}
    };
    fetchBroadcast();
    return () => { ignore = true; };
  }, [title, status]);

  const handleIncrement = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid || !id) return;
      setIncLoading(true);
      const colRef = collection(db, uid);
      const ref = doc(colRef, id);
      const next = (epCount || 0) + 1;
      await updateDoc(ref, { epWatch: next });
      setEpCount(next);
    } catch (e) {
      // noop
    } finally {
      setIncLoading(false);
    }
  };

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
          <div className="flex items-center justify-between">
            <span className="text-green-300">Episodes:</span>
            <span className="text-green-400 font-semibold flex items-center gap-2">
              {epCount}
              <button
                onClick={handleIncrement}
                disabled={incLoading}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#39d353] text-black font-bold hover:bg-green-500 disabled:opacity-50"
                title="Increment episode"
              >
                +
              </button>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-300">Start Date:</span>
            <span className="text-green-400 font-semibold">{start || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-300">Finish Date:</span>
            <span className="text-green-400 font-semibold">{finish || '-'}</span>
          </div>
          {(status || '').toLowerCase() === 'watching' && broadcast.day && broadcast.time && (
            <div className="mt-3">
              <Countdown airingDay={broadcast.day} airingTime={broadcast.time} timeZone={broadcast.tz || 'Asia/Tokyo'} />
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-green-400 text-green-400 hover:bg-green-500 hover:text-white font-bold"
            onClick={() => onEdit(id, status, epCount, score, start, finish)}
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyAnimeCard; 