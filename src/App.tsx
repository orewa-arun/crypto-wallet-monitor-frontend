import React, { useState } from "react";
import { auth } from "./auth/firebase/config";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { useAuth } from "./hooks/useAuth";
import GetBalance from "./features/test/GetBalance";

const provider = new GoogleAuthProvider();

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const loginWithGoogle = async () => {
    setError(null);
    setLoginLoading(true);
    try {
      await signInWithPopup(auth, provider);
      // user state updates via useAuth hook
    } catch (err) {
      // Narrow error type
      if (err && typeof err === "object" && "response" in err) {
        // Type assertion because err is unknown
        const axiosError = err as { response?: { data?: { detail?: string } } };
        setError(
          axiosError.response?.data?.detail || "Failed to fetch balance"
        );
      } else if (err instanceof Error) {
        // fallback to generic error message from Error object
        setError(err.message || "Failed to sign in");
      } else {
        setError("Unknown error : Failed to sign in");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err) {
      // Narrow error type
      if (err && typeof err === "object" && "response" in err) {
        // Type assertion because err is unknown
        const axiosError = err as { response?: { data?: { detail?: string } } };
        setError(
          axiosError.response?.data?.detail || "Failed to fetch balance"
        );
      } else if (err instanceof Error) {
        // fallback to generic error message from Error object
        setError(err.message || "Failed to sign out");
      } else {
        setError("Unknown error : Failed to sign out");
      }
    }
  };

  if (loading) return <div>Loading user...</div>;

  if (!user)
    return (
      <div>
        <h1>Please sign in</h1>
        <button onClick={loginWithGoogle} disabled={loginLoading}>
          {loginLoading ? "Signing in..." : "Sign in with Google"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );

  return (
    <div>
      <h1>Welcome, {user.displayName}</h1>
      <button onClick={logout}>Logout</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <GetBalance />
    </div>
  );
};

export default App;
