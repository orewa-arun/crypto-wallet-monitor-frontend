import axios from "axios";
import { auth } from "./config";

const authenticatedAPIClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
});

authenticatedAPIClient.interceptors.request.use(async (config) => {
  // Check for Web3 token first
  const web3Token = sessionStorage.getItem('web3_token');
  
  if (web3Token) {
    config.headers.Authorization = `Bearer ${web3Token}`;
    return config;
  }
  
  // Fall back to Firebase token
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default authenticatedAPIClient;