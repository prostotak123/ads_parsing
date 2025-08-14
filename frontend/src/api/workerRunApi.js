import coreApi from './coreApi';

// Отримати всі логи запуску воркерів (тільки read-only)
export const fetchWorkerLogs = () => coreApi.get('/logs/');
