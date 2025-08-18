import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const HeaderPage = () => {
  const navigate = useNavigate();
  const [uid, setUid] = useState('');
  const [email, setEmail] = useState('');
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [showSignOutConfirmation, setShowSignOutConfirmation] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      setUid(auth.currentUser.uid || '');
      setEmail(auth.currentUser.email || '');
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSignOut = () => setShowSignOutConfirmation(true);
  const confirmSignOut = () => {
    signOut(auth).then(() => navigate('/')).catch(err => alert(err.message));
  };
  const cancelSignOut = () => setShowSignOutConfirmation(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <header className="bg-[#11141a] border-b border-green-500/40 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4 md:p-3">
          {/* Logo */}
          <Link to="/homepage" className="flex items-center space-x-3">
            <svg
              className="w-12 h-12 md:w-14 md:h-14"
              viewBox="0 0 841.9 595.3"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g fill="none" stroke="#00FF6A" strokeWidth="20">
                <ellipse cx="420.9" cy="296.5" rx="250" ry="100" />
                <ellipse cx="420.9" cy="296.5" rx="250" ry="100" transform="rotate(60 420.9 296.5)" />
                <ellipse cx="420.9" cy="296.5" rx="250" ry="100" transform="rotate(120 420.9 296.5)" />
              </g>
              <circle fill="#00FF6A" cx="420.9" cy="296.5" r="45.7" />
            </svg>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
              AnimeTracker
            </span>
          </Link>


          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/homepage"
              className="text-white border border-green-500/0 hover:border-green-500 px-4 py-2 rounded-lg transition-all"
            >
              Home
            </Link>
            <Link
              to="/mylist"
              className="text-white border border-green-500/0 hover:border-green-500 px-4 py-2 rounded-lg transition-all"
            >
              My List
            </Link>
            <Link
              to="/schedules"
              className="text-white border border-green-500/0 hover:border-green-500 px-4 py-2 rounded-lg transition-all"
            >
              Schedules
            </Link>
            <Link
              to="/random"
              className="text-white border border-green-500/0 hover:border-green-500 px-4 py-2 rounded-lg transition-all"
            >
              Random
            </Link>
          </nav>

          {/* User Info & Mobile Button */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-white/60 text-sm truncate max-w-[120px]">{email}</div>
            <button
              onClick={handleSignOut}
              className="hidden md:inline-block text-white border border-green-500 hover:bg-green-500/10 px-4 py-2 rounded-lg transition-all"
            >
              Sign Out
            </button>
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg border border-green-500/30 hover:border-green-500 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#11141a] border-t border-green-500/40 animate-slide-down">
            <nav className="flex flex-col p-4 space-y-2">
              <Link
                to="/homepage"
                onClick={toggleMobileMenu}
                className="text-white border border-green-500/0 hover:border-green-500 text-center py-2 rounded-lg transition-all"
              >
                Home
              </Link>
              <Link
                to="/mylist"
                onClick={toggleMobileMenu}
                className="text-white border border-green-500/0 hover:border-green-500 text-center py-2 rounded-lg transition-all"
              >
                My List
              </Link>
              <Link
                to="/schedules"
                onClick={toggleMobileMenu}
                className="text-white border border-green-500/0 hover:border-green-500 text-center py-2 rounded-lg transition-all"
              >
                Schedules
              </Link>
              <Link
                to="/random"
                onClick={toggleMobileMenu}
                className="text-white border border-green-500/0 hover:border-green-500 text-center py-2 rounded-lg transition-all"
              >
                Random
              </Link>
              <div className="border-t border-green-500/40 pt-2">
                <p className="text-white/60 text-sm text-center mb-2 truncate">{email}</p>
                <button
                  onClick={handleSignOut}
                  className="w-full text-white border border-green-500 hover:bg-green-500/10 py-2 rounded-lg transition-all"
                >
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Time Display - Fixed Bottom Left */}
        <div className="fixed bottom-4 left-4 text-white/60 bg-[#11141a]/70 border border-green-500 px-3 py-1 rounded-lg backdrop-blur-sm text-sm z-50">
          {time}
        </div>


        {/* Sign Out Confirmation */}
        {showSignOutConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
            <div className="bg-[#11141a] text-white p-6 rounded-xl max-w-md w-[90%] shadow-2xl border border-green-500">
              <div className="text-center mb-6">
                <p className="text-xl font-semibold">Sign Out</p>
                <p className="text-white/60 mt-2">Are you sure you want to sign out?</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={confirmSignOut}
                  className="flex-1 bg-green-500 text-black py-3 rounded-lg font-semibold hover:bg-green-600 transition-all"
                >
                  Yes, Sign Out
                </button>
                <button
                  onClick={cancelSignOut}
                  className="flex-1 bg-gray-800 py-3 rounded-lg text-white hover:bg-gray-700 font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
      <Outlet />
    </>
  );
};

export default HeaderPage;
