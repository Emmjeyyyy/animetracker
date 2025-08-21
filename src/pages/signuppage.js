import React, { useMemo, useState } from 'react'
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (field, value) => {
        setSignupinfo(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const strength = useMemo(() => {
        const pwd = signupinfo.password || '';
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return Math.min(score, 4); // 0..4
    }, [signupinfo.password]);

    const signUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (signupinfo.password !== signupinfo.confirmPassword) {
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
            <div
                className="pointer-events-none fixed inset-0 z-0"
                aria-hidden="true"
                style={{
                    background: 'radial-gradient(120vmax 90vmax at 50% 125%, rgba(57,211,83,0.14) 0%, rgba(57,211,83,0.08) 25%, rgba(57,211,83,0.04) 50%, rgba(57,211,83,0.02) 65%, transparent 85%), linear-gradient(to top, rgba(34,197,94,0.06), #13161e 50%)',
                    backgroundRepeat: 'no-repeat, no-repeat',
                    backgroundSize: '100% 100%, 100% 100%',
                    backgroundPosition: 'center bottom, center'
                }}
            />
            <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-0">
                <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-green-500/40 via-emerald-400/30 to-green-300/20 shadow-2xl">
                    <div className="bg-gradient-to-br from-[#0f172a]/90 to-[#0b1220]/90 rounded-2xl p-8 border border-green-400/20 min-h-[640px] flex flex-col justify-between">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-6">
                                <svg className="h-16 w-16 drop-shadow-[0_0_12px_rgba(57,211,83,0.35)]" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="128" cy="128" r="120" fill="#111827" />
                                    <g>
                                        <ellipse rx="90" ry="36" cx="128" cy="128" fill="none" stroke="#39d353" strokeWidth="12" />
                                        <ellipse rx="90" ry="36" cx="128" cy="128" fill="none" stroke="#39d353" strokeWidth="12" transform="rotate(60 128 128)" />
                                        <ellipse rx="90" ry="36" cx="128" cy="128" fill="none" stroke="#39d353" strokeWidth="12" transform="rotate(120 128 128)" />
                                        <circle cx="128" cy="128" r="16" fill="#39d353" />
                                    </g>
                                </svg>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#39d353] to-green-300 bg-clip-text text-transparent">
                                Create Account
                            </h2>
                            <p className="text-green-300/80 mt-2">Join AnimeTracker and start tracking your anime</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={signUp} className="space-y-5">
                            <Input
                                type="email"
                                name="email"
                                autoComplete="email"
                                label="Email Address"
                                value={signupinfo.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Enter your email"
                                required
                                leftElement={
                                    <span className="text-gray-400 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.94 6.94A1.5 1.5 0 0 1 4.5 6h11a1.5 1.5 0 0 1 1.06.44l-6.56 4.38a1.5 1.5 0 0 1-1.68 0L2.94 6.94Z" />
                                            <path d="M18 8.118l-6.106 4.077a3.5 3.5 0 0 1-3.788 0L2 8.118V14.5A1.5 1.5 0 0 0 3.5 16h13a1.5 1.5 0 0 0 1.5-1.5V8.118Z" />
                                        </svg>
                                    </span>
                                }
                            />

                            <Input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                autoComplete="new-password"
                                label="Password"
                                value={signupinfo.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                placeholder="Create a password"
                                required
                                leftElement={
                                    <span className="text-gray-400 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z" />
                                        </svg>
                                    </span>
                                }
                                rightElement={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        className="text-gray-400 hover:text-gray-200 focus:outline-none"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 5c-7 0-10 7-10 7s2.5 5 8.5 6.7l-2-2C5.2 15.7 3.7 13.4 3 12c1.2-2.2 4.5-6 9-6 1.5 0 2.9.4 4.1 1l1.5-1.5C15.8 5.6 13.9 5 12 5zm9.7-1.3l-18 18 1.6 1.6 3.2-3.2c1.1.4 2.2.6 3.5.6 7 0 10-7 10-7-.6-1.3-1.7-3-3.4-4.5l3.1-3.1-1.6-1.6zM12 9a3 3 0 012.8 4l-3.8-3.8c.3-.1.6-.2 1-.2zm-3 3c0-.3.1-.7.2-1l3.7 3.7c-.4.2-.9.3-1.4.3a3 3 0 01-3-3z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 110-10 5 5 0 010 10z" />
                                            </svg>
                                        )}
                                    </button>
                                }
                            />

                            {/* Strength bar */}
                            <div className="h-2 w-full bg-gray-700 rounded-md overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${
                                        strength <= 1 ? 'w-1/4 bg-red-500' :
                                        strength === 2 ? 'w-1/2 bg-yellow-500' :
                                        strength === 3 ? 'w-3/4 bg-green-500' :
                                        'w-full bg-emerald-500'
                                    }`}
                                />
                            </div>
                            <p className="text-xs text-gray-400 -mt-2">Use at least 8 characters, with a mix of letters, numbers and symbols.</p>

                            <Input
                                type={showConfirm ? 'text' : 'password'}
                                name="confirmPassword"
                                autoComplete="new-password"
                                label="Confirm Password"
                                value={signupinfo.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                placeholder="Confirm your password"
                                required
                                leftElement={
                                    <span className="text-gray-400 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z" />
                                        </svg>
                                    </span>
                                }
                                rightElement={
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((s) => !s)}
                                        className="text-gray-400 hover:text-gray-200 focus:outline-none"
                                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirm ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 5c-7 0-10 7-10 7s2.5 5 8.5 6.7l-2-2C5.2 15.7 3.7 13.4 3 12c1.2-2.2 4.5-6 9-6 1.5 0 2.9.4 4.1 1l1.5-1.5C15.8 5.6 13.9 5 12 5zm9.7-1.3l-18 18 1.6 1.6 3.2-3.2c1.1.4 2.2.6 3.5.6 7 0 10-7 10-7-.6-1.3-1.7-3-3.4-4.5l3.1-3.1-1.6-1.6zM12 9a3 3 0 012.8 4l-3.8-3.8c.3-.1.6-.2 1-.2zm-3 3c0-.3.1-.7.2-1l3.7 3.7c-.4.2-.9.3-1.4.3a3 3 0 01-3-3z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 110-10 5 5 0 010 10z" />
                                            </svg>
                                        )}
                                    </button>
                                }
                            />

                            <Button
                                type="submit"
                                fullWidth
                                disabled={isLoading}
                                className="mt-4 bg-[#39d353] hover:bg-green-500 text-white font-bold border-2 border-green-400 shadow-lg"
                            >
                                {isLoading ? (
                                    <span className="inline-flex items-center justify-center w-full">
                                        <span className="h-4 w-32 bg-white/30 rounded animate-pulse"></span>
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>

                            {/* Footer */}
                            <div className="pt-4 text-center">
                                <p className="text-green-400">
                                    Already have an account?{' '}
                                    <Link 
                                        to="/" 
                                        className="text-[#39d353] hover:text-green-300 font-semibold transition-colors duration-200"
                                    >
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Signuppage
