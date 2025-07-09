import axios from 'axios';

const coreApi = axios.create({
  baseURL: import.meta.env.VITE_CORE_API_BASE_URL,
  withCredentials: true, // Щоб автоматично надсилати cookies (наприклад, refresh-token)
});

export default coreApi;
