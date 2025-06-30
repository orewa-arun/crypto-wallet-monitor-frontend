import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Wallet, 
  Edit3, 
  Save, 
  X, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  User
} from "lucide-react";
import { 
  fetchMonitoredAddresses, 
  updateWalletAlias,
  type MonitoredAddress 
} from "../api";

interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

const ContactBook: React.FC = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<MonitoredAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [editingAlias, setEditingAlias] = useState("");
  const [savingAddress, setSavingAddress] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetchMonitoredAddresses();
      setAddresses(response.monitored_addresses || []);
    } catch (err) {
      console.error("Error fetching addresses:", err);
      addToast('error', "Failed to fetch addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

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
      addToast('error', "Alias cannot be empty");
      return;
    }

    try {
      setSavingAddress(address);
      await updateWalletAlias(address, editingAlias);
      
      // Update local state
      setAddresses(prev => prev.map(addr => 
        addr.crypto_address === address 
          ? { ...addr, alias: editingAlias }
          : addr
      ));
      
      setEditingAddress(null);
      setEditingAlias("");
      addToast('success', "Alias updated successfully");
    } catch (err) {
      console.error("Error updating alias:", err);
      addToast('error', "Failed to update alias");
    } finally {
      setSavingAddress(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading contact book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Toast Messages */}
      <div className="fixed top-4 right-4 z-[10000] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center p-4 rounded-lg shadow-lg backdrop-blur-lg border transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-green-500/20 border-green-500/30 text-green-300'
                : 'bg-red-500/20 border-red-500/30 text-red-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            )}
            <p className="text-sm flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-current hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-white hover:text-gray-300 transition duration-200 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Contact Book</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            Monitored Wallet Addresses
          </h2>
          
          {addresses.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No addresses in your contact book</p>
              <p className="text-gray-500 text-sm mb-6">Add wallet addresses from the dashboard to manage their aliases here.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.crypto_address}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <Wallet className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        {editingAddress === address.crypto_address ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editingAlias}
                              onChange={(e) => setEditingAlias(e.target.value)}
                              className="flex-1 px-3 py-1 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter alias"
                              maxLength={100}
                            />
                            <button
                              onClick={() => handleSaveAlias(address.crypto_address)}
                              disabled={savingAddress === address.crypto_address}
                              className="p-1 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded transition duration-200 disabled:opacity-50"
                              title="Save alias"
                            >
                              {savingAddress === address.crypto_address ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-500/20 rounded transition duration-200"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <p className="text-white font-medium">
                              {address.alias || "Unnamed Wallet"}
                            </p>
                            <button
                              onClick={() => handleEditAlias(address)}
                              className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition duration-200"
                              title="Edit alias"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <p className="text-gray-400 font-mono text-sm truncate mt-1">
                          {address.crypto_address}
                        </p>
                      </div>
                    </div>
                    {address.created_at && (
                      <p className="text-gray-500 text-xs mt-2">
                        Added: {new Date(address.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactBook; 