import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Mail, Lock, Loader, ArrowRight, CheckCircle, Shield, Zap, Sun, Moon } from 'lucide-react';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen w-full ${isDark ? 'bg-gradient-to-br from-gray-900 via-black to-blue-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'} flex`}>
      <div className="container mx-auto px-4 py-12 lg:py-24 flex items-center">
        <div className="w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Content */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className={`text-4xl lg:text-6xl font-bold ${isDark ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' : 'text-blue-900'} leading-tight`}>
                LXchange
              </h1>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700/50' 
                    : 'text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                {isDark ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            </div>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              Join the future of referral marketing. Connect, share, and earn in our cutting-edge ecosystem.
            </p>
            
            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-6 pt-8">
              <div className={`flex items-start gap-4 p-4 rounded-xl ${isDark ? 'bg-white/5 backdrop-blur-lg border border-white/10' : 'bg-white/80 backdrop-blur-lg border border-blue-100'}`}>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <Shield className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Secure Platform</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Advanced encryption and verification systems</p>
                </div>
              </div>
              
              <div className={`flex items-start gap-4 p-4 rounded-xl ${isDark ? 'bg-white/5 backdrop-blur-lg border border-white/10' : 'bg-white/80 backdrop-blur-lg border border-blue-100'}`}>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                  <Zap className={`h-6 w-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Instant Rewards</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Get points immediately upon task completion</p>
                </div>
              </div>
              
              <div className={`flex items-start gap-4 p-4 rounded-xl ${isDark ? 'bg-white/5 backdrop-blur-lg border border-white/10' : 'bg-white/80 backdrop-blur-lg border border-blue-100'}`}>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-pink-500/20' : 'bg-pink-100'}`}>
                  <CheckCircle className={`h-6 w-6 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Verified Tasks</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>All submissions are carefully reviewed</p>
                </div>
              </div>
              
              <div className={`flex items-start gap-4 p-4 rounded-xl ${isDark ? 'bg-white/5 backdrop-blur-lg border border-white/10' : 'bg-white/80 backdrop-blur-lg border border-blue-100'}`}>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-100'}`}>
                  <ArrowRight className={`h-6 w-6 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Easy to Use</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Intuitive interface for seamless experience</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Auth Form */}
          <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            {/* Decorative Elements */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

            <div className={`${isDark ? 'backdrop-blur-lg bg-white/10 border border-white/20' : 'bg-white/80 backdrop-blur-lg border border-blue-100'} p-8 rounded-2xl shadow-2xl relative z-10`}>
              <div className="text-center mb-8">
                <h2 className={`text-3xl font-bold ${isDark ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400' : 'text-blue-900'}`}>
                  {isLogin ? 'Welcome Back' : 'Join the Future'}
                </h2>
                <p className={isDark ? 'mt-2 text-gray-300' : 'mt-2 text-gray-600'}>
                  {isLogin ? 'Access your account' : 'Create your account'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <Mail className={`absolute left-3 top-3 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className={`w-full pl-10 pr-4 py-3 ${
                      isDark 
                        ? 'bg-black/30 border border-white/10 text-white placeholder-gray-400' 
                        : 'bg-white/50 border border-gray-200 text-gray-900 placeholder-gray-500'
                    } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className={`absolute left-3 top-3 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={`w-full pl-10 pr-4 py-3 ${
                      isDark 
                        ? 'bg-black/30 border border-white/10 text-white placeholder-gray-400' 
                        : 'bg-white/50 border border-gray-200 text-gray-900 placeholder-gray-500'
                    } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader className="animate-spin h-5 w-5" />
                  ) : (
                    isLogin ? 'Sign In' : 'Sign Up'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className={`text-sm ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                >
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <span className="font-semibold text-blue-400 hover:text-blue-300">
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}