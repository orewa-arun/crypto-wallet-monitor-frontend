import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../auth/firebase/config";
import type { User } from "firebase/auth";
import type { Web3User } from "../auth/web3/web3AuthService";
import { logout as web3Logout } from "../auth/web3/web3AuthService";

export type AuthUser = User | Web3User;
export type AuthMethod = 'firebase' | 'web3';

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  authMethod: AuthMethod | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    authMethod: null
  });

  useEffect(() => {
    // Check for existing Web3 auth first
    const web3Token = sessionStorage.getItem('web3_token');
    const web3User = sessionStorage.getItem('web3_user');

    if (web3Token && web3User) {
      try {
        const user = JSON.parse(web3User) as Web3User;
        setAuthState({
          user,
          loading: false,
          authMethod: 'web3'
        });
        return;
      } catch {
        // Invalid stored data, clear it
        sessionStorage.removeItem('web3_token');
        sessionStorage.removeItem('web3_user');
      }
    }

    // Set up Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setAuthState({
        user: firebaseUser,
        loading: false,
        authMethod: firebaseUser ? 'firebase' : null
      });
    });

    return () => unsubscribe();
  }, []);

  const logout = () => {
    if (authState.authMethod === 'web3') {
      web3Logout();
    } else if (authState.authMethod === 'firebase') {
      auth.signOut();
    }
    
    setAuthState({
      user: null,
      loading: false,
      authMethod: null
    });
  };

  const setWeb3Auth = (user: Web3User, token: string) => {
    sessionStorage.setItem('web3_token', token);
    sessionStorage.setItem('web3_user', JSON.stringify(user));
    
    setAuthState({
      user,
      loading: false,
      authMethod: 'web3'
    });
  };

  return { 
    user: authState.user, 
    loading: authState.loading, 
    authMethod: authState.authMethod,
    logout,
    setWeb3Auth
  };
}