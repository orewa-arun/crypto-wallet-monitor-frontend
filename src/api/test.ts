import authenticatedAPIClient from "../auth/firebase/authenticatedAPIClient";
import type { BalanceResponse } from "./types";

// Get test balance
export const getTestBalance = async (): Promise<BalanceResponse> => {
  const response = await authenticatedAPIClient.get("/test/balance");
  return response.data;
};

// Re-export types for convenience
export type { BalanceResponse }; 