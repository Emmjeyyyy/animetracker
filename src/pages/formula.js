import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Homepage = () => {
  const [animeList, setAnimeList] = useState([]);

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);

        const animeDataMap = {};

        // Loop through each user
        usersSnapshot.forEach((userDoc) => {
          const userAnimeCollection = collection(db, userDoc.id);
          const promise = getDocs(userAnimeCollection);

          promise.then((userAnimeSnapshot) => {
            // Loop through each anime of the user
            userAnimeSnapshot.forEach((doc) => {
              const anime = doc.data();
              const { title, score } = anime;

              // Update animeDataMap with score and count for each title
              if (animeDataMap[title]) {
                animeDataMap[title].totalScore += parseInt(score);
                animeDataMap[title].count += 1;
              } else {
                animeDataMap[title] = {
                  totalScore: parseInt(score),
                  count: 1,
                };
              }
            });

            // Calculate average score for each title
            const animeData = Object.keys(animeDataMap).map((title) => ({
              title,
              score: animeDataMap[title].totalScore / animeDataMap[title].count, // Calculate average score
              averageScore: parseFloat(animeDataMap[title].totalScore / animeDataMap[title].count), // Convert to double
            }));

            // Set the animeList state with the calculated average scores
            setAnimeList(animeData);
          });
        });
      } catch (error) {
        console.error('Error fetching anime data:', error);
      }
    };

    fetchAnimeData();
  }, []);


  return (
    <div className='flex flex-col justify-center items-center h-[300vh]'>
      {/* Display anime list with average scores */}
      {animeList.map((animeData, index) => (
        <div key={index} className='flex flex-row text-white text-[30px] items-center space-x-2 bg-[#333b4a] w-full rounded-[10px] border-[#56c7ff] border-r-[4px]'>
          <div className='w-[30px] h-[50px] items-center justify-center flex'>
            <p>{index + 1}</p>
          </div>
          <div className=' items-center justify-center flex space-x-2'>
            <p>TITLE: {animeData.title}</p>
            <p>AVERAGE SCORE: <span className='text-green-600'>{animeData.averageScore}</span></p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Homepage;




xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Homepage = () => {
  const [animeList, setAnimeList] = useState([]);
  const [onePieceAverage, setOnePieceAverage] = useState(null);
  const [naruto, setNaruto] = useState(null);

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);

        const animeDataMap = {};

        // Loop through each user
        usersSnapshot.forEach((userDoc) => {
          const userAnimeCollection = collection(db, userDoc.id);
          const promise = getDocs(userAnimeCollection);

          promise.then((userAnimeSnapshot) => {
            // Loop through each anime of the user
            userAnimeSnapshot.forEach((doc) => {
              const anime = doc.data();
              const { title, score } = anime;

              // Update animeDataMap with score and count for each title
              if (animeDataMap[title]) {
                animeDataMap[title].totalScore += parseInt(score);
                animeDataMap[title].count += 1;
              } else {
                animeDataMap[title] = {
                  totalScore: parseInt(score),
                  count: 1,
                };
              }
            });

            // Calculate average score for each title
            const animeData = Object.keys(animeDataMap).map((title) => ({
              title,
              score: animeDataMap[title].totalScore / animeDataMap[title].count, // Calculate average score
              averageScore: parseFloat(animeDataMap[title].totalScore / animeDataMap[title].count), // Convert to double
            }));

            // Set the animeList state with the calculated average scores
            setAnimeList(animeData);

            // Calculate average score for "One Piece"
            const onePieceData = animeData.find((anime) => anime.title === 'One Piece');
            if (onePieceData) {
              setOnePieceAverage(onePieceData.averageScore);
            }

            const narutos = animeData.find((anime) => anime.title === 'Naruto');
            if (narutos) {
              setNaruto(narutos.averageScore);
            }
          });
        });
      } catch (error) {
        console.error('Error fetching anime data:', error);
      }
    };

    fetchAnimeData();
  }, []);

  return (
    <div className='flex flex-col justify-center items-center h-[300vh]'>
        <p class='text-white text-[40px]'>Average Score for One Piece: {onePieceAverage}</p>
        <p class='text-white text-[40px]'>Average Score for Naruto: {naruto}</p>
    </div>
  );
};

export default Homepage;
