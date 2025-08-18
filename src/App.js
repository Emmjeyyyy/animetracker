import './App.css';
import Loginpage from './pages/loginpage';
import Homepage from './pages/homepage';
import HeaderPage from './pages/header';
import Mylistpage from './pages/mylistpage';
import Signuppage from './pages/signuppage';
import AnimeDetails from './pages/AnimeDetails'; // ✅ new details page
import AnimeSchedule from './components/AnimeSchedule';
import RandomPage from './pages/RandomPage';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="bg-[#13161e] min-h-screen">
      <Routes>
        {/* Login */}
        <Route path='/' element={<Loginpage />} />

        {/* Signup */}
        <Route path='/signup' element={<Signuppage />} />

        {/* Homepage */}
        <Route 
          path='/homepage' 
          element={
            <>
              <HeaderPage />
              <Homepage />
            </>
          } 
        />

        {/* My List */}
        <Route 
          path='/mylist' 
          element={
            <>
              <HeaderPage />
              <Mylistpage />
            </>
          } 
        />

        {/* Anime Details Page */}
        <Route 
          path='/anime/:id' 
          element={
            <>
              <HeaderPage /> 
              <AnimeDetails />  {/* ✅ new page */}
            </>
          } 
        />
        {/* Schedules Page */}
        <Route 
          path='/schedules' 
          element={
            <>
              <HeaderPage />
              <AnimeSchedule />
            </>
          }
        />
        {/* Random Page */}
        <Route 
          path='/random' 
          element={
            <>
              <HeaderPage />
              <RandomPage />
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
