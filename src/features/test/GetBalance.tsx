import React, { useState } from "react";
import { getTestBalance } from "../../api";

const GetBalance: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTestBalance();
      setBalance(response.amount);
    } catch (err) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } };
        setError(
          axiosError.response?.data?.detail || "Failed to fetch balance"
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error : Failed to fetch balance");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Your Balance</h2>
      <button onClick={fetchBalance} disabled={loading}>
        {loading ? "Loading..." : "Get Balance"}
      </button>
      {balance !== null && <p>Balance: {balance}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default GetBalance;