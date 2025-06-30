import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  MessageCircle, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Copy,
  RefreshCw
} from "lucide-react";
import { 
  generateTelegramConnectLink, 
  getTelegramConnectionStatus,
  type TelegramConnectLinkResponse,
  type TelegramConnectionStatusResponse
} from "../api";

interface TelegramConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TelegramConnectModal: React.FC<TelegramConnectModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [connectionLink, setConnectionLink] = useState<TelegramConnectLinkResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasConnectedRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      generateLink();
      hasConnectedRef.current = false;
      startStatusPolling();
    } else {
      setConnectionLink(null);
      setError(null);
      setCopied(false);
      stopStatusPolling();
    }
    // Cleanup on unmount
    return () => {
      stopStatusPolling();
    };
  }, [isOpen]);

  const generateLink = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const link = await generateTelegramConnectLink();
      setConnectionLink(link);
    } catch (err) {
      console.error("Error generating Telegram link:", err);
      setError("Failed to generate connection link. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const status: TelegramConnectionStatusResponse = await getTelegramConnectionStatus();
      // Only call onSuccess once per modal open
      if (status.has_connections && !hasConnectedRef.current) {
        hasConnectedRef.current = true;
        stopStatusPolling();
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Error checking connection status:", err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const startStatusPolling = () => {
    stopStatusPolling(); // Ensure no duplicate intervals
    pollingIntervalRef.current = setInterval(() => {
      if (isOpen) {
        checkConnectionStatus();
      } else {
        stopStatusPolling();
      }
    }, 3000);
  };

  const stopStatusPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const copyToClipboard = async () => {
    if (connectionLink?.deep_link) {
      try {
        await navigator.clipboard.writeText(connectionLink.deep_link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
      }
    }
  };

  const openTelegramLink = () => {
    if (connectionLink?.deep_link) {
      window.open(connectionLink.deep_link, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Connect Telegram</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {isGenerating ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
              <p className="text-white">Generating connection link...</p>
            </div>
          ) : connectionLink ? (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="text-blue-300 font-medium mb-3">How to connect:</h3>
                <ol className="text-blue-200 text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                    {connectionLink.instructions.step1}
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                    {connectionLink.instructions.step2}
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                    {connectionLink.instructions.step3}
                  </li>
                </ol>
                <p className="text-blue-300 text-xs mt-3 italic">
                  {connectionLink.instructions.note}
                </p>
              </div>

              {/* Connection Link */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Connection Link
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={connectionLink.deep_link}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm font-mono"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    title="Copy link"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={openTelegramLink}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Telegram</span>
                </button>
                <button
                  onClick={generateLink}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  title="Generate new link"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Status Check */}
              <div className="text-center">
                <button
                  onClick={checkConnectionStatus}
                  disabled={isCheckingStatus}
                  className="text-purple-300 hover:text-purple-200 text-sm transition-colors flex items-center space-x-2 mx-auto"
                >
                  {isCheckingStatus ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>Check connection status</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Failed to generate connection link</p>
              <button
                onClick={generateLink}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TelegramConnectModal; 