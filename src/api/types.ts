// Wallet-related types
export interface MonitoredAddress {
  crypto_address: string;
  alias?: string;
  created_at?: string;
  updated_at?: string;
  last_checked?: string;
}

export interface AddWalletRequest {
  address: string;
  alias: string;
}

export interface UpdateAliasRequest {
  alias: string;
}

export interface MonitoredAddressesResponse {
  monitored_addresses: MonitoredAddress[];
}

export interface AddWalletResponse {
  message?: string;
  success?: boolean;
  status?: string;
  address?: string;
  alias?: string;
}

export interface UpdateAliasResponse {
  message: string;
  address: string;
  alias: string;
}

// Test-related types
export interface BalanceResponse {
  amount: number;
}

// Subscription-related types
export interface SubscriptionInfo {
  user: {
    user_id: number;
    firebase_uid: string;
    email_enabled: boolean;
    sms_enabled: boolean;
    telegram_enabled: boolean;
    created_at?: string;
    updated_at?: string;
  };
  emails: SubscriptionEmail[];
  phones: SubscriptionPhone[];
  telegram_subscriptions: TelegramChat[];
}

export interface SubscriptionEmail {
  id?: number;
  email: string;
  is_primary: boolean;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionPhone {
  id?: number;
  phone_number: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TelegramChat {
  id?: number;
  telegram_chat_id: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionSettingsRequest {
  email_enabled: boolean;
  sms_enabled: boolean;
  telegram_enabled: boolean;
}

export interface AddEmailRequest {
  email: string;
  is_primary?: boolean;
}

export interface AddPhoneRequest {
  phone_number: string;
  is_primary?: boolean;
}

export interface AddTelegramRequest {
  telegram_chat_id: string;
  is_primary?: boolean;
}

export interface RemoveEmailRequest {
  email: string;
}

export interface RemovePhoneRequest {
  phone_number: string;
}

export interface RemoveTelegramRequest {
  telegram_chat_id: string;
}

export interface SubscriptionResponse {
  message: string;
  subscription_info: SubscriptionInfo;
}

// Telegram connection types
export interface TelegramConnectLinkResponse {
  message: string;
  deep_link: string;
  token: string;
  expires_in_minutes: number;
  instructions: {
    step1: string;
    step2: string;
    step3: string;
    note: string;
  };
}

export interface TelegramConnectionStatusResponse {
  message: string;
  telegram_enabled: boolean;
  connected_chats: number;
  telegram_subscriptions: TelegramChat[];
  active_connection_tokens: number;
  has_connections: boolean;
} 