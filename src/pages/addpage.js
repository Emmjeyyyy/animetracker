//        NOT USED
import { useState } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';


const Addpage = ({ onClose, anime, image }) => {
  const [status, setStatus] = useState('Watching');
  const [epWatch, setEpWatch] = useState(0);
  const [start, setStart] = useState('');
  const [finish, setFinish] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const curruser = auth.currentUser.uid;
  const collectionRef = collection(db, curruser);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type }), 3000);
  };

  const addAnime = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Check if anime already exists
        const snapshot = await getDocs(collectionRef);
        const exists = snapshot.docs.some(doc => doc.data().title === anime);
        if (exists) {
          showNotification('Anime already exists in your list!', 'error');
          return;
        }
        await addDoc(collectionRef, {
          title: anime,
          image,
          status,
          epWatch,
          start,
          finish,
        });
        showNotification('Anime added to your list!', 'success');
        setTimeout(onClose, 3200);
      } else {
        showNotification('User not found', 'error');
      }
    } catch (error) {
      showNotification('Error adding anime', 'error');
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-80 z-50 font-sans">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-lg border-2 ${notification.type === 'success' ? 'border-green-500 bg-[#161b22] text-green-400' : 'border-red-500 bg-[#161b22] text-red-400'} animate-fade-in`}>
          <span className="font-bold">{notification.message}</span>
        </div>
      )}
      <div className="bg-[#161b22] border-2 border-green-500 p-8 rounded-2xl flex flex-col w-[400px] min-h-[500px] shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-green-400 text-center">Add Anime</h2>
        <p className="mb-6 text-lg text-green-300 text-center">{anime}</p>

        <div className="mb-4">
          <label className="block text-green-400 font-semibold mb-2">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full p-2 rounded-lg border border-green-500 bg-[#0d1117] text-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="Watching">Watching</option>
            <option value="Completed">Completed</option>
            <option value="On-Hold">On-Hold</option>
            <option value="Dropped">Dropped</option>
            <option value="Plan to Watch">Plan to Watch</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-green-400 font-semibold mb-2">Episodes Watched</label>
          <input
            type="number"
            min="0"
            value={epWatch}
            onChange={e => setEpWatch(Number(e.target.value))}
            className="w-full p-2 rounded-lg border border-green-500 bg-[#0d1117] text-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-green-400 font-semibold mb-2">Start Date</label>
          <input
            type="date"
            value={start}
            onChange={e => setStart(e.target.value)}
            className="w-full p-2 rounded-lg border border-green-500 bg-[#0d1117] text-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="mb-6">
          <label className="block text-green-400 font-semibold mb-2">Finish Date</label>
          <input
            type="date"
            value={finish}
            onChange={e => setFinish(e.target.value)}
            className="w-full p-2 rounded-lg border border-green-500 bg-[#0d1117] text-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="flex justify-end gap-3 mt-auto">
          <button
            onClick={addAnime}
            className="bg-green-700 hover:bg-green-600 text-green-300 font-bold py-2 px-6 rounded-lg shadow-lg transition-colors duration-200 border-2 border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <span className="text-green-300">Add</span>
          </button>
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 text-green-300 font-bold py-2 px-6 rounded-lg border-2 border-green-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Addpage;
