import React, { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';

const Signuppage = () => {
    const [signupinfo, setSignupinfo] = useState({
        email:'',
        password:'',
        confirmPassword:''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (field, value) => {
        setSignupinfo(prev => ({ ...prev, [field]: value }));
        setError(''); // Clear error when user types
    };

    const signUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if(signupinfo.password !== signupinfo.confirmPassword){
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }
        
        try {
            await createUserWithEmailAndPassword(auth, signupinfo.email, signupinfo.password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

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
                            Create Account
                        </h2>
                        <p className="text-green-300 mt-2">Join AnimeTracker and start tracking your anime</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Signup Form */}
                    <form onSubmit={signUp} className="space-y-6">
                        <Input
                            type="email"
                            label="Email Address"
                            value={signupinfo.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter your email"
                            required
                        />

                        <Input
                            type="password"
                            label="Password"
                            value={signupinfo.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="Create a password"
                            required
                        />

                        <Input
                            type="password"
                            label="Confirm Password"
                            value={signupinfo.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            placeholder="Confirm your password"
                            required
                        />

                        <Button
                            type="submit"
                            fullWidth
                            disabled={isLoading}
                            className="mt-8 bg-[#39d353] hover:bg-green-500 text-white font-bold border-2 border-green-400 shadow-lg"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    {/* Sign In Link */}
                    <div className="mt-8 text-center">
                        <p className="text-green-400">
                            Already have an account?{' '}
                            <Link 
                                to="/" 
                                className="text-[#39d353] hover:text-green-400 font-semibold transition-colors duration-200"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Signuppage
