import React, { useEffect, useMemo, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import Layout from '../components/Layout';
import MyAnimeCard from '../components/MyAnimeCard';
import Addpage from './addpage';
import FilterButtons from '../components/FilterButtons';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import EditAnimeForm from '../components/EditAnimeForm';
import Button from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';


const Mylistpage = () => {
  const [animelist, setAnimelist] = useState([]);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editingAnime, setEditingAnime] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cur, setCur] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [animeToAdd, setAnimeToAdd] = useState('');
  const [animeImage, setAnimeImage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // Handle Add to My List button
  const handleAddToList = (animeObj) => {
    setAnimeToAdd(animeObj.title);
    setAnimeImage(animeObj.image);
    setShowAddModal(true);
  };
  const navigate = useNavigate();

  // Auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) navigate('/');
      else setCur(user.uid);
    });
    return () => unsubscribe();
  }, [navigate]);

  // Collection ref
  const collectionRef = useMemo(() => cur && collection(db, cur), [cur]);

  // Fetch anime list
  useEffect(() => {
    const fetchAnime = async () => {
      setIsLoading(true);
      try {
        if (!collectionRef) return;
        const querySnapshot = await getDocs(collectionRef);
        const d = [];
        querySnapshot.forEach((doc) => {
          const anime = { id: doc.id, ...doc.data() };
          d.push(anime);
        });
        setAnimelist(d);
      } catch (error) {
        console.error('Error', error);
        setAnimelist([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (collectionRef) fetchAnime();
  }, [collectionRef]);

  // Edit anime
  const editAnime = async (formData) => {
    try {
      if (!collectionRef || !editingAnime) return;
      const animeRef = doc(collectionRef, editingAnime.id);
      await updateDoc(animeRef, formData);
      setAnimelist(prevList =>
        prevList.map(anime =>
          anime.id === editingAnime.id ? { ...anime, ...formData } : anime
        )
      );
      setIsEditPopupOpen(false);
      setEditingAnime(null);
    } catch (error) {
      console.error('Error updating anime:', error);
    }
  };

  // Delete anime
  const deleteAnime = async (animeId) => {
    try {
      if (!collectionRef) return;
      await deleteDoc(doc(collectionRef, animeId));
      setAnimelist(prevList => prevList.filter(anime => anime.id !== animeId));
    } catch (error) {
      console.error('Error deleting anime:', error);
    }
  };

  // Edit popup
  const toggleEditPopup = (animeId, status, epWatch, score, start, finish) => {
    const anime = animelist.find(a => a.id === animeId);
    setEditingAnime({
      id: animeId,
      title: anime.title,
      status,
      epWatch,
      score,
      start,
      finish
    });
    setIsEditPopupOpen(true);
  };


  // Removed hardcoded image URLs. Use anime.image from Firestore/Jikan API.

  // Filtered list
  const filteredAnimeList = useMemo(() => {
    let list = animelist;

    if (selectedCategory) {
      list = list.filter(anime => anime.status && anime.status.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(anime => (anime.title || '').toLowerCase().includes(q));
    }

    return list;
  }, [animelist, selectedCategory, searchTerm]);

  return (
    <>
      <Layout>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in My List..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              aria-label="Search in my list"
            />
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <FilterButtons
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        <div className="min-h-[300px] bg-[#161b22] rounded-2xl p-6 shadow-lg border border-green-500/50">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-[#0f141a] rounded-2xl p-4 border border-green-500/20 animate-pulse">
                  <div className="w-full h-48 bg-gray-800 rounded-xl mb-4"></div>
                  <div className="h-5 bg-gray-800 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : animelist.length === 0 ? (
            <EmptyState
              title="No Anime Added Yet"
              description="Start building your anime collection by adding some shows from the homepage."
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              action={
                <Link to="/homepage">
                  <Button variant="primary" size="lg">
                    Browse Anime
                  </Button>
                </Link>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                {filteredAnimeList.map((anime) => (
                  <MyAnimeCard
                    key={anime.id}
                    anime={anime}
                    onEdit={toggleEditPopup}
                    onAddToList={handleAddToList}
                  />
                ))}
              </div>

              {/* No results for filter */}
              {filteredAnimeList.length === 0 && animelist.length > 0 && (
                <div className="mt-8">
                  <EmptyState
                    title="No Anime Found"
                    description={`No anime found${selectedCategory ? ` in the "${selectedCategory}" category` : ''}${searchTerm ? ` matching "${searchTerm}"` : ''}.`}
                    action={
                      <Button 
                        variant="outline" 
                        onClick={() => { setSelectedCategory(''); setSearchTerm(''); }}
                      >
                        Clear Filters
                      </Button>
                    }
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Layout>

      {/* Add Anime Modal */}
      {showAddModal && (
        <Addpage
          anime={animeToAdd}
          image={animeImage}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditPopupOpen}
        onClose={() => {
          setIsEditPopupOpen(false);
          setEditingAnime(null);
        }}
        title={null}
        size="md"
        className="bg-transparent border-none shadow-none"
      >
        <EditAnimeForm
          anime={editingAnime}
          maxEpisodes={editingAnime && editingAnime.episodes}
          onSubmit={editAnime}
          onCancel={() => {
            setIsEditPopupOpen(false);
            setEditingAnime(null);
          }}
          onDelete={async (animeId) => {
            await deleteAnime(animeId);
            setIsEditPopupOpen(false);
            setEditingAnime(null);
          }}
        />
      </Modal>
    </>
  );
};

export default Mylistpage;
