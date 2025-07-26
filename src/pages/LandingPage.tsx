import React, { useState, useEffect } from "react";
import { auth } from "../auth/firebase/config";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Web3Auth from "../components/Web3Auth";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { Web3User } from "../auth/web3/web3AuthService";

const provider = new GoogleAuthProvider();

const LandingPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'google' | 'wallet'>('google');
  const { user, setWeb3Auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('LandingPage - User state changed:', user);
  }, [user]);

  const loginWithGoogle = async () => {
    setError(null);
    setLoginLoading(true);
    try {
      console.log('Attempting Google sign in...');
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign in successful:', result.user);
    } catch (err) {
      console.error('Google sign in error:', err);
      if (err instanceof Error) {
        setError(err.message || "Failed to sign in");
      } else {
        setError("Unknown error: Failed to sign in");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleWeb3Success = (user: Web3User, token: string) => {
    console.log('Web3 authentication successful, setting auth state...');
    setError(null);
    setSuccess(`Successfully connected wallet: ${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`);
    setWeb3Auth(user, token);
    console.log('Auth state updated, useEffect should handle redirect');
  };

  const handleWeb3Error = (error: string) => {
    console.error('Web3 authentication error:', error);
    setError(error);
    setSuccess(null);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="flex justify-between items-center p-6 lg:p-8">
          <div className="flex items-center space-x-3">
            <div className="relative p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl">
              <img 
                src="/cryptoRooster.png" 
                alt="CryptoRooster Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white">
              CryptoRooster
            </h1>
          </div>
          <div className="hidden md:flex space-x-6">
            <button className="text-gray-300 hover:text-white transition-colors duration-200">Features</button>
            <button className="text-gray-300 hover:text-white transition-colors duration-200">Security</button>
            <button className="text-gray-300 hover:text-white transition-colors duration-200">Contact</button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-8">
          <div className="max-w-7xl w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Left Side - Hero Content */}
              <div className="text-center lg:text-left space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center space-x-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-full px-4 py-2 mb-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-500 font-medium">Real-time crypto monitoring</span>
                  </div>
                  
                  <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-white">
                    Never Miss a
                    <br />
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                      Transaction
                    </span>
                  </h1>
                  
                  <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                    Get instant Telegram notifications for every deposit, withdrawal, 
                    and transaction on your crypto wallet addresses. Stay ahead of the curve.
                  </p>
                </div>

                {/* Feature Highlights */}
                <div className="grid sm:grid-cols-3 gap-6 mt-12">
                  <div className="bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl p-6 hover:bg-opacity-10 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Instant Alerts</h3>
                    <p className="text-sm text-gray-400">Real-time notifications within seconds</p>
                  </div>

                  <div className="bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl p-6 hover:bg-opacity-10 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Secure</h3>
                    <p className="text-sm text-gray-400">Bank-level encryption & privacy</p>
                  </div>

                  <div className="bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl p-6 hover:bg-opacity-10 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Multi-Wallet</h3>
                    <p className="text-sm text-gray-400">Monitor unlimited addresses</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Auth Card */}
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-md">
                  <div className="bg-white bg-opacity-10 rounded-3xl p-8 shadow-2xl border border-white border-opacity-20 relative">
                    
                    {/* Card Header */}
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl">
                          <img 
                            src="/cryptoRooster.png" 
                            alt="CryptoRooster Logo" 
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <h2 className="text-2xl font-bold text-black">
                          Get Started
                        </h2>
                      </div>
                      <p className="text-gray-500 text-sm">
                        Choose your preferred authentication method
                      </p>
                    </div>

                    {/* Auth Method Toggle */}
                    <div className="mb-8">
                      <div className="flex bg-white bg-opacity-5 rounded-xl p-1 border border-white border-opacity-10">
                        <button
                          onClick={() => setAuthMethod('google')}
                          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                            authMethod === 'google'
                              ? 'bg-white text-gray-900 shadow-lg'
                              : 'text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-5'
                          }`}
                        >
                          Google
                        </button>
                        <button
                          onClick={() => setAuthMethod('wallet')}
                          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                            authMethod === 'wallet'
                              ? 'bg-white text-gray-900 shadow-lg'
                              : 'text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-5'
                          }`}
                        >
                          Wallet
                        </button>
                      </div>
                    </div>

                    {/* Auth Components */}
                    <div className="space-y-4">
                      {authMethod === 'google' ? (
                        <button
                          onClick={loginWithGoogle}
                          disabled={loginLoading}
                          className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-3 shadow-lg"
                        >
                          {loginLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                              <span>Signing in...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                              <span>Continue with Google</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <Web3Auth onSuccess={handleWeb3Success} onError={handleWeb3Error} />
                      )}

                      {error && (
                        <div className="p-4 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-xl">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-300 text-sm">{error}</p>
                          </div>
                        </div>
                      )}

                      {success && (
                        <div className="space-y-3">
                          <div className="p-4 bg-green-500 bg-opacity-20 border border-green-500 border-opacity-30 rounded-xl">
                            <div className="flex items-center space-x-2 mb-3">
                              <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <p className="text-green-300 text-sm">{success}</p>
                            </div>
                          </div>
                          <button
                            onClick={handleGoToDashboard}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            Go to Dashboard →
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Terms */}
                    <div className="mt-8 text-center">
                      <p className="text-gray-400 text-xs leading-relaxed">
                        By signing in, you agree to our{" "}
                        <button className="text-purple-400 hover:text-purple-300 underline transition-colors duration-200">
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button className="text-purple-400 hover:text-purple-300 underline transition-colors duration-200">
                          Privacy Policy
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 CryptoRooster. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <button className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">Privacy</button>
              <button className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">Terms</button>
              <button className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">Support</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;