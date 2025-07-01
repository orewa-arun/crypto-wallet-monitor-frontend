import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Plus, Trash2, Wallet, AlertCircle, CheckCircle, Loader2, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  fetchMonitoredAddresses, 
  addWalletToMonitoring, 
  removeWalletFromMonitoring,
  type MonitoredAddress 
} from "../api";
import DashboardMenu from "../components/DashboardMenu";

const Dashboard: React.FC = () => {
  const { user, authMethod, logout } = useAuth();
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState("");
  const [walletAlias, setWalletAlias] = useState("");
  const [monitoredAddresses, setMonitoredAddresses] = useState<MonitoredAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<string | null>(null);

  // Fetch monitored addresses on component mount
  useEffect(() => {
    fetchMonitoredAddressesData();
  }, []);

  const fetchMonitoredAddressesData = async () => {
    try {
      setAddressesLoading(true);
      const response = await fetchMonitoredAddresses();
      setMonitoredAddresses(response.monitored_addresses || []);
    } catch (err) {
      console.error("Error fetching monitored addresses:", err);
      setError("Failed to fetch monitored addresses");
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress.trim() || !walletAlias.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await addWalletToMonitoring(walletAddress, walletAlias);

      setSuccess(`Successfully added ${walletAlias} (${walletAddress}) to monitoring!`);
      setWalletAddress("");
      setWalletAlias("");
      console.log(response);
      
      // Refresh the list of monitored addresses
      await fetchMonitoredAddressesData();
    } catch (err: unknown) {
      console.error("Error adding wallet:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to add wallet to monitoring";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (address: string) => {
    setDeletingAddress(address);
    setError(null);

    try {
      await removeWalletFromMonitoring(address);
      setSuccess(`Successfully removed ${address} from monitoring`);
      
      // Update the local state
      setMonitoredAddresses(prev => prev.filter(addr => addr.crypto_address !== address));
    } catch (err: unknown) {
      console.error("Error deleting address:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to remove address from monitoring";
      setError(errorMessage);
    } finally {
      setDeletingAddress(null);
    }
  };

  const handleSignOut = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Wallet className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Crypto Wallet Monitor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white text-sm">
                  {authMethod === 'firebase' && 'displayName' in user 
                    ? (user.displayName || user.email) 
                    : authMethod === 'web3' && 'walletAddress' in user
                    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                    : 'User'
                  }
                </p>
                <p className="text-gray-300 text-xs">
                  {authMethod === 'firebase' && 'email' in user 
                    ? user.email 
                    : authMethod === 'web3' && 'walletAddress' in user
                    ? user.walletAddress
                    : ''
                  }
                </p>
              </div>
              
              {/* Subscription Settings Button */}
              <button
                onClick={() => navigate('/notification-settings')}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200"
                title="Notification Settings"
              >
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">Notifications</span>
              </button>
              
              <DashboardMenu onSignOut={handleSignOut} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Wallet Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add Wallet to Monitor
            </h2>
            
            <form onSubmit={handleAddWallet} className="space-y-4">
              <div>
                <label htmlFor="walletAlias" className="block text-sm font-medium text-gray-300 mb-2">
                  Wallet Alias
                </label>
                <input
                  type="text"
                  id="walletAlias"
                  value={walletAlias}
                  onChange={(e) => setWalletAlias(e.target.value)}
                  placeholder="My Main Wallet"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-300 mb-2">
                  Ethereum Wallet Address
                </label>
                <input
                  type="text"
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !walletAddress.trim() || !walletAlias.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Adding Wallet...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Add to Monitoring
                  </>
                )}
              </button>
            </form>

            {/* Success/Error Messages */}
            {success && (
              <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Monitored Addresses List */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Monitored Addresses
            </h2>
            
            {addressesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-white animate-spin mr-2" />
                <span className="text-white">Loading addresses...</span>
              </div>
            ) : monitoredAddresses.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No addresses being monitored yet.</p>
                <p className="text-gray-500 text-sm mt-2">Add a wallet address to start monitoring.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {monitoredAddresses.map((address) => (
                  <div
                    key={address.crypto_address}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-medium">
                          {address.alias || "Unnamed Wallet"}
                        </p>
                        {address.alias && (
                          <span className="text-gray-400 text-xs">({address.crypto_address.slice(0, 8)}...{address.crypto_address.slice(-6)})</span>
                        )}
                      </div>
                      {!address.alias && (
                        <p className="text-white font-mono text-sm truncate">
                          {address.crypto_address}
                        </p>
                      )}
                      {address.created_at && (
                        <p className="text-gray-400 text-xs mt-1">
                          Added: {new Date(address.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(address.crypto_address)}
                      disabled={deletingAddress === address.crypto_address}
                      className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition duration-200 disabled:opacity-50"
                      title="Remove from monitoring"
                    >
                      {deletingAddress === address.crypto_address ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 