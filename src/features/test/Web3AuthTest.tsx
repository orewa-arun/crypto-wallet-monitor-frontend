import React, { useState } from "react";
import { authenticateWithWallet } from "../../auth/web3/web3AuthService";

const Web3AuthTest: React.FC = () => {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testWeb3Auth = async () => {
    setLoading(true);
    setResult("Testing Web3 authentication...\nCheck browser console for detailed logs.");
    
    try {
      const { user, token } = await authenticateWithWallet();
      setResult(`✅ Success!\n\nWallet: ${user.walletAddress}\nToken: ${token.slice(0, 20)}...\n\nCheck console for detailed logs.`);
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck console for detailed logs.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white/10 rounded-lg">
      <h3 className="text-white mb-4">Web3 Authentication Test</h3>
      <button
        onClick={testWeb3Auth}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test Web3 Auth"}
      </button>
      {result && (
        <div className="mt-4 p-2 bg-gray-800 rounded text-sm">
          <pre className="text-white">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default Web3AuthTest; 