import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User, Info, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await register(formData.name, formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-4rem)] bg-[#E7E4D8] text-[#161D18] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#49755B]/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-3xl font-black text-[#161D18] tracking-tight">{isRegistering ? 'Create Your Account' : 'Welcome Back'}</h2>
          <p className="text-xs text-[#575D58] font-medium">{isRegistering ? 'Join your sales workspace to start managing leads' : 'Sign in to access your CRM pipeline'}</p>
        </div>

        <div className="bg-[#F0EEE4]/95 backdrop-blur-md border border-[#C5C2B4] rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#FAF8F0] rounded-full mb-6 border border-[#C5C2B4]/80">
            <button
              type="button"
              onClick={() => { setIsRegistering(false); setError(''); }}
              className={`py-2 text-xs font-black rounded-full transition-all ${!isRegistering ? 'bg-[#2A4B3A] text-white shadow-xs' : 'text-[#575D58] hover:text-[#161D18]'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`py-2 text-xs font-black rounded-full transition-all ${isRegistering ? 'bg-[#2A4B3A] text-white shadow-xs' : 'text-[#575D58] hover:text-[#161D18]'}`}
            >
              Register
            </button>
          </div>

          {error && <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Jane Doe" className="w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-xl pl-10 pr-4 py-2.5 text-[#161D18] text-sm focus:border-2 focus:border-[#2A4B3A] focus:bg-white outline-none transition-all" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="jane@example.com" className="w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-xl pl-10 pr-4 py-2.5 text-[#161D18] text-sm focus:border-2 focus:border-[#2A4B3A] focus:bg-white outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-xl pl-10 pr-4 py-2.5 text-[#161D18] text-sm focus:border-2 focus:border-[#2A4B3A] focus:bg-white outline-none transition-all" />
              </div>
            </div>

            {isRegistering && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-medium">
                <Info className="w-4 h-4 shrink-0 text-amber-700" />
                <span>All new accounts are registered as Team Members.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-[#2A4B3A] hover:bg-[#1E372B] text-white font-bold text-xs sm:text-sm rounded-full shadow-md shadow-[#2A4B3A]/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isRegistering ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
