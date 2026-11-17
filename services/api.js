import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Where the backend lives:
// - EXPO_PUBLIC_API_URL wins if set (e.g. https://mindguard-ai.vercel.app/api for the phone app,
//   or http://localhost:3000 when running `npm run web` against a local backend).
// - On the hosted website the API is on the same domain under /api.
// - Otherwise (Expo Go on a phone, no env set) fall back to the laptop's LAN address.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'web' ? '/api' : 'http://172.20.10.5:3000');

const api = axios.create({ baseURL: BASE_URL, timeout: 20000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (email, password) => api.post('/auth/login', { email, password });
export const signup = (name, email, password) => api.post('/auth/signup', { name, email, password });
export const getDashboard = () => api.get('/dashboard');
export const logWellnessData = (data) => api.post('/dashboard/log', data);
export const getAIInsight = (data) => api.post('/ai/insight', data);

export default api;
