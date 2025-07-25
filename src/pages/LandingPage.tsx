import React, { useState, useEffect } from "react";
import { auth } from "../auth/firebase/config";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Web3Auth from "../components/Web3Auth";
import { useAuth } from "../hooks/useAuth";
import type { Web3User } from "../auth/web3/web3AuthService";


const provider = new GoogleAuthProvider();

const LandingPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'google' | 'wallet'>('google');
  const { user, setWeb3Auth } = useAuth();

  // Debug: Monitor when user becomes authenticated
  useEffect(() => {
    if (user) {
      console.log('User authenticated, should redirect to dashboard:', user);
    }
  }, [user]);

  const loginWithGoogle = async () => {
    setError(null);
    setLoginLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
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
    console.log('Auth state updated, should redirect to dashboard');
  };

  const handleWeb3Error = (error: string) => {
    setError(error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex flex-col items-center justify-center mb-6">
            <img 
              src="/cryptoRooster.png" 
              alt="CryptoRooster Logo" 
              className="w-16 h-16 md:w-20 md:h-20 object-contain mb-4"
            />
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              CryptoRooster
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Get instant email and SMS notifications for every deposit, withdrawal, 
            and transaction on your crypto wallet addresses.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Features */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Real-time Monitoring</h3>
              </div>
              <p className="text-gray-300">
                Monitor multiple wallet addresses simultaneously with instant transaction detection.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Smart Notifications</h3>
              </div>
              <p className="text-gray-300">
                Receive detailed notifications via email and SMS for deposits, withdrawals, and transactions.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Secure & Private</h3>
              </div>
              <p className="text-gray-300">
                Your wallet data is encrypted and secure. We never store your private keys.
              </p>
            </div>
          </div>

          {/* Right Side - Sign In */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="flex justify-between items-center py-8">
              <div className="flex items-center space-x-3">
                <img 
                  src="/cryptoRooster.png" 
                  alt="CryptoRooster Logo" 
                  className="w-10 h-10 object-contain"
                />
                <h1 className="text-3xl font-bold text-white">CryptoRooster</h1>
              </div>
              <p className="text-gray-300">
                Choose your preferred authentication method
              </p>
            </div>

            {/* Auth Method Toggle */}
            <div className="flex bg-white/10 rounded-lg p-1 mb-6">
              <button
                onClick={() => setAuthMethod('google')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  authMethod === 'google'
                    ? 'bg-white text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Google
              </button>
              <button
                onClick={() => setAuthMethod('wallet')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  authMethod === 'wallet'
                    ? 'bg-white text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Wallet
              </button>
            </div>

            {/* Auth Components */}
            {authMethod === 'google' ? (
              <button
                onClick={loginWithGoogle}
                disabled={loginLoading}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
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
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-300 text-sm mb-3">{success}</p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Go to Dashboard
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                By signing in, you agree to our{" "}
                <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-gray-400 text-sm">
            © 2024 CryptoRooster. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 