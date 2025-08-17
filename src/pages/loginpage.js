import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';

const Loginpage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const emailChange = (e) => {
    setEmail(e.target.value);
    setError(''); // Clear error when user types
  };

  const passwordChange = (e) => {
    setPassword(e.target.value);
    setError(''); // Clear error when user types
  };

  const signIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      if (user) {
        // Store user ID in Firestore collection
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { uid: user.uid });
  
        navigate('/homepage');
      } else {
        throw new Error('User not found.');
      }
    } catch (error) {
      console.error('Error signing in:', error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/homepage');
      }
    });
  }, [navigate]);

  return (
    <Layout container={false} className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md mx-auto">
  <div className="bg-gradient-to-br from-[#161b22]/90 to-[#222c1a]/90 backdrop-bl-sm rounded-2xl p-8 shadow-2xl border border-[#39d353]/40">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <svg className="h-16 w-16" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="128" cy="128" r="120" fill="#161b22" />
                <g>
                  <ellipse rx="90" ry="36" cx="128" cy="128" fill="none" stroke="#39d353" strokeWidth="12" />
                  <ellipse rx="90" ry="36" cx="128" cy="128" fill="none" stroke="#39d353" strokeWidth="12" transform="rotate(60 128 128)" />
                  <ellipse rx="90" ry="36" cx="128" cy="128" fill="none" stroke="#39d353" strokeWidth="12" transform="rotate(120 128 128)" />
                  <circle cx="128" cy="128" r="16" fill="#39d353" />
                </g>
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#39d353] to-green-400 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-green-300 mt-2">Sign in to your AnimeTracker account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={signIn} className="space-y-6">
            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={emailChange}
              placeholder="Enter your email"
              required
            />

            <Input
              type="password"
              label="Password"
              value={password}
              onChange={passwordChange}
              placeholder="Enter your password"
              required
            />

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
              className="mt-8 bg-[#39d353] hover:bg-green-500 text-white font-bold border-2 border-green-400 shadow-lg"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-green-400">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-[#39d353] hover:text-green-400 font-semibold transition-colors duration-200"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Loginpage;
