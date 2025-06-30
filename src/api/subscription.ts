import authenticatedAPIClient from "../auth/firebase/authenticatedAPIClient";
import type { 
  SubscriptionInfo,
  SubscriptionEmail,
  SubscriptionPhone,
  TelegramChat,
  SubscriptionSettingsRequest,
  AddEmailRequest,
  AddPhoneRequest,
  AddTelegramRequest,
  RemoveEmailRequest,
  RemovePhoneRequest,
  RemoveTelegramRequest,
  SubscriptionResponse,
  TelegramConnectLinkResponse,
  TelegramConnectionStatusResponse
} from "./types";

// Get complete subscription information
export const getSubscriptionInfo = async (): Promise<SubscriptionInfo> => {
  const response = await authenticatedAPIClient.get("user/subscription-info");
  return response.data.subscription_info;
};

// Update subscription settings
export const updateSubscriptionSettings = async (settings: SubscriptionSettingsRequest): Promise<SubscriptionResponse> => {
  const response = await authenticatedAPIClient.put("/user/subscription-settings", settings);
  return response.data;
};

// Email management
export const getSubscriptionEmails = async (): Promise<SubscriptionEmail[]> => {
  const response = await authenticatedAPIClient.get("/user/subscription-emails");
  return response.data.emails;
};

export const addSubscriptionEmail = async (email: string, isPrimary: boolean = false): Promise<SubscriptionResponse> => {
  const response = await authenticatedAPIClient.post("/user/subscription-emails", {
    email,
    is_primary: isPrimary
  });
  return response.data;
};

export const removeSubscriptionEmail = async (email: string): Promise<SubscriptionResponse> => {
  const response = await authenticatedAPIClient.delete("/user/subscription-emails", {
    data: { email }
  });
  return response.data;
};

// Phone management
export const getSubscriptionPhones = async (): Promise<SubscriptionPhone[]> => {
  const response = await authenticatedAPIClient.get("/user/subscription-phones");
  return response.data.phones;
};

export const addSubscriptionPhone = async (phoneNumber: string, isPrimary: boolean = false): Promise<SubscriptionResponse> => {
  const response = await authenticatedAPIClient.post("/user/subscription-phones", {
    phone_number: phoneNumber,
    is_primary: isPrimary
  });
  return response.data;
};

export const removeSubscriptionPhone = async (phoneNumber: string): Promise<SubscriptionResponse> => {
  const response = await authenticatedAPIClient.delete("/user/subscription-phones", {
    data: { phone_number: phoneNumber }
  });
  return response.data;
};

// Telegram management
export const getTelegramChats = async (): Promise<TelegramChat[]> => {
  const response = await authenticatedAPIClient.get("/user/subscription-telegram");
  return response.data.telegram_chats;
};

export const addTelegramChat = async (telegramChatId: string, isPrimary: boolean = false): Promise<SubscriptionResponse> => {
  const response = await authenticatedAPIClient.post("/user/subscription-telegram", {
    telegram_chat_id: telegramChatId,
    is_primary: isPrimary
  });
  return response.data;
};

export const removeTelegramChat = async (telegramChatId: string): Promise<SubscriptionResponse> => {
  const response = await authenticatedAPIClient.delete("/user/subscription-telegram", {
    data: { telegram_chat_id: telegramChatId }
  });
  return response.data;
};

export const updateTelegramEnabled = async (enabled: boolean): Promise<SubscriptionResponse> => {
  const response = await authenticatedAPIClient.put("/user/subscription-telegram-enabled", {
    telegram_enabled: enabled
  });
  return response.data;
};

export const testTelegram = async (): Promise<SubscriptionResponse> => {
  const response = await authenticatedAPIClient.post("/user/test-telegram");
  return response.data;
};

// New Telegram connection functions
export const generateTelegramConnectLink = async (): Promise<TelegramConnectLinkResponse> => {
  const response = await authenticatedAPIClient.post("/user/telegram-connect-link");
  return response.data;
};

export const getTelegramConnectionStatus = async (): Promise<TelegramConnectionStatusResponse> => {
  const response = await authenticatedAPIClient.get("/user/telegram-connection-status");
  return response.data;
};

// Helper functions for primary status management
export const setPrimaryEmail = async (email: string): Promise<void> => {
  // Remove current primary and add new primary
  const currentEmails = await getSubscriptionEmails();
  const currentPrimary = currentEmails.find(e => e.is_primary);
  
  if (currentPrimary && currentPrimary.email !== email) {
    // Remove current primary status
    await removeSubscriptionEmail(currentPrimary.email);
    // Re-add without primary status
    await addSubscriptionEmail(currentPrimary.email, false);
  }
  
  // Remove the target email and re-add with primary status
  await removeSubscriptionEmail(email);
  await addSubscriptionEmail(email, true);
};

export const setPrimaryPhone = async (phoneNumber: string): Promise<void> => {
  // Remove current primary and add new primary
  const currentPhones = await getSubscriptionPhones();
  const currentPrimary = currentPhones.find(p => p.is_primary);
  
  if (currentPrimary && currentPrimary.phone_number !== phoneNumber) {
    // Remove current primary status
    await removeSubscriptionPhone(currentPrimary.phone_number);
    // Re-add without primary status
    await addSubscriptionPhone(currentPrimary.phone_number, false);
  }
  
  // Remove the target phone and re-add with primary status
  await removeSubscriptionPhone(phoneNumber);
  await addSubscriptionPhone(phoneNumber, true);
};

export const setPrimaryTelegram = async (telegramChatId: string): Promise<void> => {
  // Remove current primary and add new primary
  const currentChats = await getTelegramChats();
  const currentPrimary = currentChats.find(c => c.is_primary);
  
  if (currentPrimary && currentPrimary.telegram_chat_id !== telegramChatId) {
    // Remove current primary status
    await removeTelegramChat(currentPrimary.telegram_chat_id);
    // Re-add without primary status
    await addTelegramChat(currentPrimary.telegram_chat_id, false);
  }
  
  // Remove the target chat and re-add with primary status
  await removeTelegramChat(telegramChatId);
  await addTelegramChat(telegramChatId, true);
};

// Re-export types for convenience
export type { 
  SubscriptionInfo, 
  SubscriptionEmail, 
  SubscriptionPhone, 
  TelegramChat,
  SubscriptionSettingsRequest,
  AddEmailRequest,
  AddPhoneRequest,
  AddTelegramRequest,
  RemoveEmailRequest,
  RemovePhoneRequest,
  RemoveTelegramRequest,
  SubscriptionResponse,
  TelegramConnectLinkResponse,
  TelegramConnectionStatusResponse
}; 