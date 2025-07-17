import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Plus, Trash2, Wallet, AlertCircle, CheckCircle, Loader2, Bell, Edit3, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  fetchMonitoredAddresses, 
  addWalletToMonitoring, 
  removeWalletFromMonitoring,
  updateWalletAlias,
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
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [editingAlias, setEditingAlias] = useState("");
  const [savingAddress, setSavingAddress] = useState<string | null>(null);

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

  const handleEditAlias = (address: MonitoredAddress) => {
    setEditingAddress(address.crypto_address);
    setEditingAlias(address.alias || "");
  };

  const handleCancelEdit = () => {
    setEditingAddress(null);
    setEditingAlias("");
  };

  const handleSaveAlias = async (address: string) => {
    if (!editingAlias.trim()) {
      setError("Alias cannot be empty");
      return;
    }
    try {
      setSavingAddress(address);
      await updateWalletAlias(address, editingAlias);
      setMonitoredAddresses(prev => prev.map(addr =>
        addr.crypto_address === address
          ? { ...addr, alias: editingAlias }
          : addr
      ));
      setEditingAddress(null);
      setEditingAlias("");
      setSuccess("Alias updated successfully");
    } catch {
      setError("Failed to update alias");
    } finally {
      setSavingAddress(null);
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

      {/* Add Wallet Form - Centered at Top, Wider */}
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 w-full shadow-lg mb-10">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center justify-center">
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
          {/* Success/Error Messages - Wrapped and Non-Overflowing */}
          {success && (
            <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center break-words whitespace-pre-line">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
              <p className="text-green-300 text-sm break-words whitespace-pre-line">{success}</p>
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center break-words whitespace-pre-line">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
              <p className="text-red-300 text-sm break-words whitespace-pre-line">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Monitored Addresses Grid - Wide and Responsive */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {monitoredAddresses.map((address) => (
              <div
                key={address.crypto_address}
                className="relative group bg-white/10 border border-white/20 rounded-xl p-5 flex flex-col shadow-md hover:shadow-lg transition duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {editingAddress === address.crypto_address ? (
                      <>
                        <input
                          type="text"
                          value={editingAlias}
                          onChange={e => setEditingAlias(e.target.value)}
                          className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 sm:w-40 md:w-48"
                          placeholder="Enter alias"
                          maxLength={100}
                        />
                        <button
                          onClick={() => handleSaveAlias(address.crypto_address)}
                          disabled={savingAddress === address.crypto_address}
                          className="ml-1 text-green-400 hover:text-green-300"
                          title="Save alias"
                        >
                          {savingAddress === address.crypto_address ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="ml-1 text-gray-400 hover:text-red-400"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-semibold text-white">
                          {address.alias || "Unnamed Wallet"}
                        </span>
                        <button
                          className="ml-1 text-gray-400 hover:text-blue-400 transition"
                          title="Copy address"
                          onClick={() => navigator.clipboard.writeText(address.crypto_address)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditAlias(address)}
                          className="ml-1 text-yellow-400 hover:text-yellow-300"
                          title="Edit alias"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(address.crypto_address)}
                    disabled={deletingAddress === address.crypto_address}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition duration-200 disabled:opacity-50"
                    title="Remove from monitoring"
                  >
                    {deletingAddress === address.crypto_address ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-xs text-gray-400 mb-1">{address.crypto_address.slice(0, 8)}...{address.crypto_address.slice(-6)}</span>
                  {address.created_at && (
                    <span className="text-xs text-gray-500 mt-1">Added: {new Date(address.created_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 