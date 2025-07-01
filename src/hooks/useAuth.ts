import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../auth/firebase/config";
import { globalAuthState, type AuthState } from "../auth/globalAuthState";
import type { Web3User } from "../auth/web3/web3AuthService";

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    authMethod: null
  });

  useEffect(() => {
    // Subscribe to global auth state
    const unsubscribe = globalAuthState.subscribe((state) => {
      console.log('useAuth: Received global auth state update:', state);
      setAuthState(state);
    });

    // Check for existing Web3 auth first
    const web3Token = sessionStorage.getItem('web3_token');
    const web3User = sessionStorage.getItem('web3_user');

    if (web3Token && web3User) {
      try {
        const user = JSON.parse(web3User);
        console.log('useAuth: Found existing Web3 auth, setting state');
        globalAuthState.setState({
          user,
          loading: false,
          authMethod: 'web3'
        });
        return; // Don't set up Firebase listener if we have Web3 auth
      } catch {
        // Invalid stored data, clear it
        sessionStorage.removeItem('web3_token');
        sessionStorage.removeItem('web3_user');
      }
    }

    // Set up Firebase auth listener
    const firebaseUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Only update state if we don't have a Web3 user already
      const currentState = globalAuthState.getState();
      if (currentState.authMethod !== 'web3') {
        globalAuthState.setState({
          user: firebaseUser,
          loading: false,
          authMethod: firebaseUser ? 'firebase' : null
        });
      }
    });

    return () => {
      unsubscribe();
      firebaseUnsubscribe();
    };
  }, []);

  const logout = () => {
    globalAuthState.logout();
  };

  const setWeb3Auth = (user: Web3User, token: string) => {
    globalAuthState.setWeb3Auth(user, token);
  };

  return { 
    user: authState.user, 
    loading: authState.loading, 
    authMethod: authState.authMethod,
    logout,
    setWeb3Auth
  };
}