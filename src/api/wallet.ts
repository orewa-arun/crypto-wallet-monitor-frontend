import authenticatedAPIClient from "../auth/firebase/authenticatedAPIClient";
import type { 
  MonitoredAddress, 
  AddWalletRequest, 
  MonitoredAddressesResponse, 
  AddWalletResponse,
  UpdateAliasRequest,
  UpdateAliasResponse
} from "./types";

// Fetch all monitored addresses for the current user
export const fetchMonitoredAddresses = async (): Promise<MonitoredAddressesResponse> => {
  const response = await authenticatedAPIClient.get("/my-addresses");
  return response.data;
};

// Add a new wallet address to monitoring
export const addWalletToMonitoring = async (address: string, alias: string): Promise<AddWalletResponse> => {
  const response = await authenticatedAPIClient.post("/add-wallet", {
    address: address.trim(),
    alias: alias.trim()
  });
  return response.data;
};

// Update alias for a monitored address
export const updateWalletAlias = async (address: string, alias: string): Promise<UpdateAliasResponse> => {
  const response = await authenticatedAPIClient.put(`/monitored-addresses/${address}/alias`, {
    alias: alias.trim()
  });
  return response.data;
};

// Remove a wallet address from monitoring
export const removeWalletFromMonitoring = async (address: string): Promise<void> => {
  await authenticatedAPIClient.delete(`/monitored-addresses/${address}`);
};

// Re-export types for convenience
export type { 
  MonitoredAddress, 
  AddWalletRequest, 
  MonitoredAddressesResponse, 
  AddWalletResponse,
  UpdateAliasRequest,
  UpdateAliasResponse
}; 