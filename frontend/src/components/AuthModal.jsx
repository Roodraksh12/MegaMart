import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { auth } from '../utils/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

import { supabase } from '../lib/supabase';

async function syncSupabaseUser(firebaseUser) {
  const id = firebaseUser.uid;
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: id,
      firebase_uid: id,
      name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
      phone: firebaseUser.phoneNumber || '',
      avatar: firebaseUser.photoURL || ''
    }, { onConflict: 'firebase_uid' })
    .select()
    .single();

  if (error) {
    console.error('Supabase sync error:', error);
    return { error: error.message };
  }
  
  return { user: data, token: firebaseUser.accessToken };
}

export default function AuthModal() {
  const { isAuthOpen, toggleAuth, login } = useStore();

  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSuccess = async (firebaseUser) => {
    const data = await syncSupabaseUser(firebaseUser);
    if (data.user) {
      login(data.user);
      localStorage.setItem('token', data.token);
      toggleAuth();
      resetState();
    } else {
      setError(data.error || 'Authentication failed. Please try again.');
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      // Sign out immediately — user must log in manually
      await auth.signOut();
      // Show success, switch to login tab with email pre-filled
      setSuccessMsg(`🎉 Account created! Please log in with your email.`);
      setPassword('');
      setName('');
      setTab('login');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('This email is already registered. Try logging in.');
      else if (err.code === 'auth/invalid-email') setError('Invalid email address.');
      else setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleSuccess(result.user);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') setError('Incorrect email or password.');
      else if (err.code === 'auth/user-not-found') setError('No account found with this email. Register first.');
      else if (err.code === 'auth/too-many-requests') setError('Too many attempts. Please wait and try again.');
      else setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleSuccess(result.user);
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMsg('');
    setShowPassword(false);
    setTab('login');
  };

  const handleClose = () => {
    resetState();
    toggleAuth();
  };

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-surface w-full max-w-sm rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 pb-4 text-center border-b border-gray-100">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="text-4xl mb-3">🛒</div>
                <h2 className="text-xl font-display font-bold text-text-dark">Welcome to SuperMart</h2>
                <p className="text-sm text-text-muted mt-1">
                  {tab === 'login' ? 'Sign in to your account' : 'Create a new account'}
                </p>

                {/* Login / Register Tabs */}
                <div className="flex mt-5 bg-gray-100 rounded-xl p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => { setTab('login'); setError(''); setSuccessMsg(''); }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'login' ? 'bg-white shadow-sm text-text-dark' : 'text-text-muted'}`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTab('register'); setError(''); setSuccessMsg(''); }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'register' ? 'bg-white shadow-sm text-text-dark' : 'text-text-muted'}`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all font-medium text-sm disabled:opacity-50"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-text-muted font-medium">OR</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Email / Password Form */}
                <form onSubmit={tab === 'login' ? handleEmailLogin : handleEmailRegister} className="space-y-3">
                  
                  {/* Name field — only on Register */}
                  {tab === 'register' && (
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  )}

                  {/* Email */}
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={tab === 'register' ? 'Create password (min. 6 chars)' : 'Password'}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-11 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Success message */}
                  {successMsg && (
                    <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
                      <span className="text-lg">✅</span>
                      {successMsg}
                    </div>
                  )}

                  {/* Error message */}
                  {error && (
                    <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading
                      ? <Loader2 size={18} className="animate-spin" />
                      : tab === 'login'
                        ? <><ChevronRight size={16} /> Sign In</>
                        : <><ChevronRight size={16} /> Create Account</>
                    }
                  </button>
                </form>

                <p className="text-[11px] text-text-muted text-center">
                  By signing in, you agree to our Terms & Privacy Policy.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
