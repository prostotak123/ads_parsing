import { useState } from 'react';
import { Button, TextField, Box, Alert } from '@mui/material';
import axios from 'axios';

function LoginPage() {
  // 🔑 Стейти для зберігання даних форми
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // 🔑 Обробка сабміту форми
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // const response = await axios.post('http://localhost:8080/login/', {
      //   email,
      //   password,
      // });
      axios.post('/api/1');
      axios.post('/api/2');
      console.log('Login success:', response.data);
      // Тут будемо зберігати токени у стейт чи cookie, додамо пізніше
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Check your credentials.');
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
        onChange={(e) (e.target.value)}
        required
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" variant="contained">
        Login
      </Button>
    </Box>
  );
}

export default LoginPage;
