import { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';
import { CircularProgress, Box } from '@mui/material';

// Створення контексту
const AuthContext = createContext();

// 👇 Це буде "обгортка" для усього додатку
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // 👈 тут буде зберігатись користувач
    const [accessToken, setAccessToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // 👈 нове

    const isAuthenticated = !!user;

    // 👇 login – коли користувач вводить email/пароль
    const login = async (email, password) => {
        try {
            const response = await authApi.post('/api/auth/login/', { email, password });
            setAccessToken(response.data.access);

            // Після логіну – отримаємо профіль
            const profile = await authApi.get('/api/auth/profile/', {
                headers: { Authorization: `Bearer ${response.data.access}` },
            });

            setUser(profile.data);
        } catch (error) {
            console.error('Login error', error);
            throw error;
        }
    };

    // 👇 logout – очищення всього
    const logout = async () => {
        try {
            await authApi.post('/api/auth/logout/');
        } catch (e) {
            console.warn('Logout failed', e);
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    };

    // 👇 Перевірка токена при завантаженні додатку
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await authApi.post('/api/auth/token/refresh/');
                const newAccess = res.data.access;
                setAccessToken(newAccess);

                const profile = await authApi.get('/api/auth/profile/', {
                    headers: { Authorization: `Bearer ${newAccess}` },
                });

                setUser(profile.data);
            } catch (e) {
                setUser(null);
                setAccessToken(null);
            } finally {
                setIsLoading(false); // ✅ обов'язково завершити завантаження
            }
        };
        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    height: '100vh',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }
    
    return (
        <AuthContext.Provider value={{ user, accessToken, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

// 👇 зручно викликати з будь-якого місця
export const useAuth = () => useContext(AuthContext);
