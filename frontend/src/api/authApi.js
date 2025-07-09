import axios from 'axios';

const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_BASE_URL,
  withCredentials: true, // Щоб автоматично надсилати cookies (наприклад, refresh-token)
});

export default authApi;
