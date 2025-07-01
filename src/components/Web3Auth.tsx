import React, { useState } from "react";
import { authenticateWithWallet } from "../auth/web3/web3AuthService";
import type { Web3User } from "../auth/web3/web3AuthService";

interface Web3AuthProps {
  onSuccess: (user: Web3User, token: string) => void;
  onError: (error: string) => void;
}

const Web3Auth: React.FC<Web3AuthProps> = ({ onSuccess, onError }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { user, token } = await authenticateWithWallet();
      onSuccess(user, token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      onError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
    >
      {isConnecting ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Connecting Wallet...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
};

export default Web3Auth; 