import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Mail, 
  Phone, 
  MessageCircle, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Star,
  StarOff,
  X,
  Link
} from "lucide-react";
import {
  getSubscriptionInfo,
  addSubscriptionEmail,
  removeSubscriptionEmail,
  addSubscriptionPhone,
  removeSubscriptionPhone,
  removeTelegramChat,
  updateSubscriptionSettings,
  testTelegram,
  setPrimaryEmail,
  setPrimaryPhone,
  setPrimaryTelegram,
  type SubscriptionInfo,
  type SubscriptionEmail,
  type SubscriptionPhone,
  type TelegramChat
} from "../api";
import TelegramConnectModal from "../components/TelegramConnectModal";

interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

const NotificationSubscription: React.FC = () => {
  const navigate = useNavigate();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showTelegramModal, setShowTelegramModal] = useState(false);

  // Form states
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [isAddingPhone, setIsAddingPhone] = useState(false);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [settingPrimary, setSettingPrimary] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const fetchSubscriptionInfo = async () => {
    try {
      setLoading(true);
      const info = await getSubscriptionInfo();
      setSubscriptionInfo(info);
    } catch (err) {
      console.error("Error fetching subscription info:", err);
      addToast('error', "Failed to load subscription information");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (field: keyof Pick<SubscriptionInfo['user'], 'email_enabled' | 'sms_enabled' | 'telegram_enabled'>) => {
    if (!subscriptionInfo) return;
    
    const newValue = !subscriptionInfo.user[field];
    
    try {
      const response = await updateSubscriptionSettings({
        email_enabled: field === 'email_enabled' ? newValue : subscriptionInfo.user.email_enabled,
        sms_enabled: field === 'sms_enabled' ? newValue : subscriptionInfo.user.sms_enabled,
        telegram_enabled: field === 'telegram_enabled' ? newValue : subscriptionInfo.user.telegram_enabled,
      });
      
      if (response) {
        // Optimistic update
        setSubscriptionInfo(prev => prev ? {
          ...prev,
          user: {
            ...prev.user,
            [field]: newValue
          }
        } : null);
        
        addToast('success', `${field.replace('_', ' ')} ${newValue ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (error) {
      addToast('error', `Failed to update ${field.replace('_', ' ')} setting`);
      console.error('Error updating settings:', error);
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      setIsAddingEmail(true);
      const isPrimary = subscriptionInfo?.emails.length === 0;
      await addSubscriptionEmail(newEmail.trim(), isPrimary);
      setNewEmail("");
      await fetchSubscriptionInfo();
      addToast('success', "Email added successfully");
    } catch (err) {
      console.error("Error adding email:", err);
      addToast('error', "Failed to add email");
    } finally {
      setIsAddingEmail(false);
    }
  };

  const handleRemoveEmail = async (email: string) => {
    try {
      setRemovingItem(`email-${email}`);
      await removeSubscriptionEmail(email);
      await fetchSubscriptionInfo();
      addToast('success', "Email removed successfully");
    } catch (err) {
      console.error("Error removing email:", err);
      addToast('error', "Failed to remove email");
    } finally {
      setRemovingItem(null);
    }
  };

  const handleSetPrimaryEmail = async (email: string) => {
    try {
      setSettingPrimary(`email-${email}`);
      await setPrimaryEmail(email);
      await fetchSubscriptionInfo();
      addToast('success', "Primary email updated successfully");
    } catch (err) {
      console.error("Error setting primary email:", err);
      addToast('error', "Failed to set primary email");
    } finally {
      setSettingPrimary(null);
    }
  };

  const handleAddPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim()) return;

    try {
      setIsAddingPhone(true);
      const isPrimary = subscriptionInfo?.phones.length === 0;
      await addSubscriptionPhone(newPhone.trim(), isPrimary);
      setNewPhone("");
      await fetchSubscriptionInfo();
      addToast('success', "Phone number added successfully");
    } catch (err) {
      console.error("Error adding phone:", err);
      addToast('error', "Failed to add phone number");
    } finally {
      setIsAddingPhone(false);
    }
  };

  const handleRemovePhone = async (phone: string) => {
    try {
      setRemovingItem(`phone-${phone}`);
      await removeSubscriptionPhone(phone);
      await fetchSubscriptionInfo();
      addToast('success', "Phone number removed successfully");
    } catch (err) {
      console.error("Error removing phone:", err);
      addToast('error', "Failed to remove phone number");
    } finally {
      setRemovingItem(null);
    }
  };

  const handleSetPrimaryPhone = async (phone: string) => {
    try {
      setSettingPrimary(`phone-${phone}`);
      await setPrimaryPhone(phone);
      await fetchSubscriptionInfo();
      addToast('success', "Primary phone number updated successfully");
    } catch (err) {
      console.error("Error setting primary phone:", err);
      addToast('error', "Failed to set primary phone number");
    } finally {
      setSettingPrimary(null);
    }
  };

  const handleRemoveTelegram = async (chatId: string) => {
    try {
      setRemovingItem(`telegram-${chatId}`);
      await removeTelegramChat(chatId);
      await fetchSubscriptionInfo();
      addToast('success', "Telegram chat ID removed successfully");
    } catch (err) {
      console.error("Error removing telegram chat:", err);
      addToast('error', "Failed to remove Telegram chat ID");
    } finally {
      setRemovingItem(null);
    }
  };

  const handleSetPrimaryTelegram = async (chatId: string) => {
    try {
      setSettingPrimary(`telegram-${chatId}`);
      await setPrimaryTelegram(chatId);
      await fetchSubscriptionInfo();
      addToast('success', "Primary Telegram chat ID updated successfully");
    } catch (err) {
      console.error("Error setting primary telegram:", err);
      addToast('error', "Failed to set primary Telegram chat ID");
    } finally {
      setSettingPrimary(null);
    }
  };

  const handleTestTelegram = async () => {
    try {
      await testTelegram();
      addToast('success', "Test Telegram message sent successfully");
    } catch (err) {
      console.error("Error sending test telegram:", err);
      addToast('error', "Failed to send test Telegram message");
    }
  };

  const handleTelegramConnectSuccess = async () => {
    await fetchSubscriptionInfo();
    addToast('success', "Telegram account connected successfully!");
  };

  const canRemoveEmail = (email: SubscriptionEmail) => {
    if (subscriptionInfo?.emails.length === 1) return true;
    return !email.is_primary;
  };

  const canRemovePhone = (phone: SubscriptionPhone) => {
    if (subscriptionInfo?.phones.length === 1) return true;
    return !phone.is_primary;
  };

  const canRemoveTelegram = (chat: TelegramChat) => {
    if (subscriptionInfo?.telegram_subscriptions.length === 1) return true;
    return !chat.is_primary;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading subscription settings...</p>
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
              className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Telegram Connect Modal */}
      <TelegramConnectModal
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
        onSuccess={handleTelegramConnectSuccess}
      />

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center text-white hover:text-gray-300 transition duration-200 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Notification Settings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {subscriptionInfo && (
          <div className="space-y-8">
            {/* Service Toggles */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Notification Services
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-400 mr-3" />
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-gray-400 text-sm">Receive notifications via email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateSettings('email_enabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      subscriptionInfo.user.email_enabled ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        subscriptionInfo.user.email_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-green-400 mr-3" />
                    <div>
                      <p className="text-white font-medium">SMS Notifications</p>
                      <p className="text-gray-400 text-sm">Receive notifications via SMS</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateSettings('sms_enabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      subscriptionInfo.user.sms_enabled ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        subscriptionInfo.user.sms_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 text-purple-400 mr-3" />
                    <div>
                      <p className="text-white font-medium">Telegram Notifications</p>
                      <p className="text-gray-400 text-sm">Receive notifications via Telegram</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateSettings('telegram_enabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      subscriptionInfo.user.telegram_enabled ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        subscriptionInfo.user.telegram_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Email Management */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Addresses
              </h2>
              
              {/* Add Email Form */}
              <form onSubmit={handleAddEmail} className="mb-6">
                <div className="flex space-x-3">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isAddingEmail}
                  />
                  <button
                    type="submit"
                    disabled={isAddingEmail || !newEmail.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition duration-200 flex items-center"
                  >
                    {isAddingEmail ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>

              {/* Email List */}
              <div className="space-y-3">
                {subscriptionInfo.emails.map((email) => (
                  <div
                    key={email.email}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-blue-400 mr-3" />
                      <div>
                        <p className="text-white font-medium">{email.email}</p>
                        <div className="flex items-center mt-1 space-x-2">
                          {email.is_primary && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              <span className="text-yellow-400 text-sm">Primary</span>
                            </div>
                          )}
                          {email.is_verified !== undefined && (
                            <div className="flex items-center">
                              {email.is_verified ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                                  <span className="text-green-400 text-sm">Verified</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-4 h-4 text-orange-400 mr-1" />
                                  <span className="text-orange-400 text-sm">Unverified</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!email.is_primary && subscriptionInfo.emails.length > 1 && (
                        <button
                          onClick={() => handleSetPrimaryEmail(email.email)}
                          disabled={settingPrimary === `email-${email.email}`}
                          className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition duration-200 disabled:opacity-50"
                          title="Set as primary"
                        >
                          {settingPrimary === `email-${email.email}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      {canRemoveEmail(email) && (
                        <button
                          onClick={() => handleRemoveEmail(email.email)}
                          disabled={removingItem === `email-${email.email}`}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition duration-200 disabled:opacity-50"
                          title="Remove email"
                        >
                          {removingItem === `email-${email.email}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {subscriptionInfo.emails.length === 0 && (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No email addresses added yet.</p>
                    <p className="text-gray-500 text-sm mt-2">Add an email address to receive notifications.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Phone Management */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Phone Numbers
              </h2>
              
              {/* Add Phone Form */}
              <form onSubmit={handleAddPhone} className="mb-6">
                <div className="flex space-x-3">
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isAddingPhone}
                  />
                  <button
                    type="submit"
                    disabled={isAddingPhone || !newPhone.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition duration-200 flex items-center"
                  >
                    {isAddingPhone ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>

              {/* Phone List */}
              <div className="space-y-3">
                {subscriptionInfo.phones.map((phone) => (
                  <div
                    key={phone.phone_number}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-green-400 mr-3" />
                      <div>
                        <p className="text-white font-medium">{phone.phone_number}</p>
                        {phone.is_primary && (
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-yellow-400 text-sm">Primary</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!phone.is_primary && subscriptionInfo.phones.length > 1 && (
                        <button
                          onClick={() => handleSetPrimaryPhone(phone.phone_number)}
                          disabled={settingPrimary === `phone-${phone.phone_number}`}
                          className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition duration-200 disabled:opacity-50"
                          title="Set as primary"
                        >
                          {settingPrimary === `phone-${phone.phone_number}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      {canRemovePhone(phone) && (
                        <button
                          onClick={() => handleRemovePhone(phone.phone_number)}
                          disabled={removingItem === `phone-${phone.phone_number}`}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition duration-200 disabled:opacity-50"
                          title="Remove phone number"
                        >
                          {removingItem === `phone-${phone.phone_number}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {subscriptionInfo.phones.length === 0 && (
                  <div className="text-center py-8">
                    <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No phone numbers added yet.</p>
                    <p className="text-gray-500 text-sm mt-2">Add a phone number to receive SMS notifications.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Telegram Management */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Telegram Connections
              </h2>
              
              {/* Connect Telegram Button */}
              <div className="mb-6">
                <button
                  onClick={() => setShowTelegramModal(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                >
                  <Link className="w-4 h-4" />
                  <span>Connect Telegram Account</span>
                </button>
                <p className="text-gray-400 text-sm mt-2 text-center">
                  Click to connect your Telegram account easily - no need to find chat IDs manually!
                </p>
              </div>

              {/* Telegram List */}
              <div className="space-y-3">
                {subscriptionInfo.telegram_subscriptions.map((chat) => (
                  <div
                    key={chat.telegram_chat_id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center">
                      <MessageCircle className="w-5 h-5 text-purple-400 mr-3" />
                      <div>
                        <p className="text-white font-medium">{chat.telegram_chat_id}</p>
                        {chat.is_primary && (
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-yellow-400 text-sm">Primary</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!chat.is_primary && subscriptionInfo.telegram_subscriptions.length > 1 && (
                        <button
                          onClick={() => handleSetPrimaryTelegram(chat.telegram_chat_id)}
                          disabled={settingPrimary === `telegram-${chat.telegram_chat_id}`}
                          className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition duration-200 disabled:opacity-50"
                          title="Set as primary"
                        >
                          {settingPrimary === `telegram-${chat.telegram_chat_id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      {canRemoveTelegram(chat) && (
                        <button
                          onClick={() => handleRemoveTelegram(chat.telegram_chat_id)}
                          disabled={removingItem === `telegram-${chat.telegram_chat_id}`}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition duration-200 disabled:opacity-50"
                          title="Remove Telegram chat ID"
                        >
                          {removingItem === `telegram-${chat.telegram_chat_id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {subscriptionInfo.telegram_subscriptions.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No Telegram accounts connected yet.</p>
                    <p className="text-gray-500 text-sm mt-2">Connect your Telegram account to receive notifications.</p>
                  </div>
                )}
              </div>

              {/* Test Telegram Button */}
              {subscriptionInfo.telegram_subscriptions.length > 0 && subscriptionInfo.user.telegram_enabled && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <button
                    onClick={handleTestTelegram}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200 flex items-center justify-center"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Test Telegram Message
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSubscription; 