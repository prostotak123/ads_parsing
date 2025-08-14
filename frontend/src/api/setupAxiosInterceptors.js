import authApi from './authApi';
import coreApi from './coreApi';

let refreshingTokenPromise = null;

export function setupAxiosInterceptors(getAccessToken, setAccessToken, logout) {
  // ✅ Інтерцептор запитів: динамічно додаємо актуальний токен
  coreApi.interceptors.request.use((config) => {
    if (!config.headers.Authorization) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // ✅ Інтерцептор відповідей: реакція на 401 / 403
  coreApi.interceptors.response.use(
    response => response,
    async error => {
      // 🛡️ Гарантована перевірка перед доступом до config
      const originalRequest = error?.config;
      if (!originalRequest) return Promise.reject(error);

      if (originalRequest._retry) return Promise.reject(error);

      const status = error.response?.status;
      if (status !== 401 && status !== 403) return Promise.reject(error);

      originalRequest._retry = true;

      if (!refreshingTokenPromise) {

        console.log('КРОК 1');

        refreshingTokenPromise = authApi.post('/api/auth/token/refresh/')
          .then(res => {
            console.log('КРОК 2');

            const newAccess = res.data.access;
            setAccessToken(newAccess);
            return newAccess;
          })
          .catch(err => {
            refreshingTokenPromise = null;
            logout();
            return Promise.reject(err);
          })
          .finally(() => {
            refreshingTokenPromise = null;
          });
      }

      try {
        console.log('КРОК 3');

        const newToken = await refreshingTokenPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        console.log('КРОК 4');
        console.log('originalRequest', originalRequest);


        return coreApi(originalRequest); // ⬅️ Повторний запит
      } catch (err) {
        console.log('КРОК 5');

        return Promise.reject(err);
      }
    }
  );
}
