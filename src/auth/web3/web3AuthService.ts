const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export interface Web3User {
  walletAddress: string;
  authMethod: 'web3';
}

export const connectWallet = async (): Promise<string> => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask or another Web3 wallet is required');
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    }) as string[];
    
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    return accounts[0];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
    throw new Error('Failed to connect wallet');
  }
};

export const getNonceAndMessage = async (walletAddress: string): Promise<{ nonce: string; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/web3/nonce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet_address: walletAddress })
    });

    if (!response.ok) {
      throw new Error('Failed to get nonce and message');
    }

    const data = await response.json();
    return { nonce: data.nonce, message: data.message };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get nonce and message: ${error.message}`);
    }
    throw new Error('Failed to get nonce and message');
  }
};

export const signMessage = async (message: string, walletAddress: string): Promise<string> => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask or another Web3 wallet is required');
  }

  try {
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, walletAddress]
    }) as string;
    
    return signature;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to sign message: ${error.message}`);
    }
    throw new Error('Failed to sign message');
  }
};

export const verifySignature = async (walletAddress: string, signature: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/web3/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet_address: walletAddress,
        signature: signature
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to verify signature');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to verify signature: ${error.message}`);
    }
    throw new Error('Failed to verify signature');
  }
};

export const authenticateWithWallet = async (): Promise<{ user: Web3User; token: string }> => {
  // Step 1: Connect wallet
  const walletAddress = await connectWallet();
  console.log('Wallet connected:', walletAddress);
  
  // Step 2: Get nonce and message from backend
  const { message } = await getNonceAndMessage(walletAddress);
  console.log('Message to sign:', message);
  
  // Step 3: Sign the exact message from backend
  const signature = await signMessage(message, walletAddress);
  console.log('Signature received:', signature);
  
  // Step 4: Verify signature and get JWT
  const token = await verifySignature(walletAddress, signature);
  console.log('Token received:', token.slice(0, 20) + '...');
  
  // Step 5: Create user object
  const user: Web3User = {
    walletAddress,
    authMethod: 'web3'
  };
  
  return { user, token };
};

export const logout = (): void => {
  sessionStorage.removeItem('web3_token');
  sessionStorage.removeItem('web3_user');
}; 