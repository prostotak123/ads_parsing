import { useState } from 'react';
import { Button, TextField, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress } from '@mui/material';

function LoginPage() {
  // 🔑 Стейти для зберігання даних форми
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // 🔑 Обробка сабміту форми
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.error) {
        setError('Неправильний email або пароль');
      } else {
        setError('Щось пішло не так. Спробуйте ще раз пізніше.');
      }
    }
    finally {
      setLoading(false);
    }
  };


  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 300, margin: '0 auto' }}
    >
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        sx={{ marginTop: "50%" }}
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Login'}
      </Button>
    </Box>
  );
}

export default LoginPage;
