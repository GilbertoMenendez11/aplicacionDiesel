import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- ¡IMPORTANTE! ---
// Tu teléfono y tu computadora deben estar en la MISMA red Wi-Fi.
// No puedes usar "localhost" porque el teléfono no sabe qué es "localhost".
// Debes usar la dirección IP de tu computadora en la red local.
// (En Windows, abre cmd y escribe "ipconfig". Busca tu "Dirección IPv4")

///const API_BASE_URL = 'http://192.168.1.26:5001/api'; 
// Ejemplo: const API_BASE_URL = 'http://192.168.1.5:5001/api';
const API_BASE_URL = 'https://transporte-api-mdsl.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Interceptor para añadir el token a todas las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;