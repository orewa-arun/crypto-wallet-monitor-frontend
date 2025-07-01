import type { Web3User } from "./web3/web3AuthService";
import type { User } from "firebase/auth";

export type AuthUser = User | Web3User;
export type AuthMethod = 'firebase' | 'web3';

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  authMethod: AuthMethod | null;
}

type AuthStateListener = (state: AuthState) => void;

class GlobalAuthState {
  private state: AuthState = {
    user: null,
    loading: true,
    authMethod: null
  };
  
  private listeners: AuthStateListener[] = [];

  getState(): AuthState {
    return { ...this.state };
  }

  setState(newState: Partial<AuthState>) {
    // Only update if the state actually changed
    const hasChanged = Object.keys(newState).some(key => {
      const k = key as keyof AuthState;
      return this.state[k] !== newState[k];
    });
    
    if (hasChanged) {
      console.log('GlobalAuthState: State changing from', this.state, 'to', { ...this.state, ...newState });
      this.state = { ...this.state, ...newState };
      this.notifyListeners();
    } else {
      console.log('GlobalAuthState: No state change detected, skipping update');
    }
  }

  subscribe(listener: AuthStateListener) {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.getState());
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    console.log('GlobalAuthState: Notifying listeners, current state:', this.state);
    this.listeners.forEach(listener => {
      listener(this.getState());
    });
  }

  setWeb3Auth(user: Web3User, token: string) {
    console.log('GlobalAuthState: Setting Web3 auth:', user);
    sessionStorage.setItem('web3_token', token);
    sessionStorage.setItem('web3_user', JSON.stringify(user));
    
    this.setState({
      user,
      loading: false,
      authMethod: 'web3'
    });
  }

  logout() {
    if (this.state.authMethod === 'web3') {
      sessionStorage.removeItem('web3_token');
      sessionStorage.removeItem('web3_user');
    }
    
    this.setState({
      user: null,
      loading: false,
      authMethod: null
    });
  }
}

// Create singleton instance
export const globalAuthState = new GlobalAuthState(); 