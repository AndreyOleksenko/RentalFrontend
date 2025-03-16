import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, Link, Alert } from '@mui/material';
import { userService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await userService.login(credentials);
      console.log('Ответ от сервера при входе:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Проверяем, есть ли поле user.role в ответе
        if (response.data.user && response.data.user.role) {
          localStorage.setItem('role', response.data.user.role);
          console.log('Роль пользователя установлена:', response.data.user.role);
        } else {
          // Если роли нет в ответе, устанавливаем роль по умолчанию 'client'
          localStorage.setItem('role', 'client');
          console.log('Роль пользователя не найдена в ответе, установлена по умолчанию: client');
        }
        
        // Редирект в зависимости от роли
        const roleRedirects = {
          'client': '/cars',
          'operator': '/operator/fleet',
          'technician': '/technician/maintenance',
          'accountant': '/accountant/accounting',
          'manager': '/manager/statistics'
        };
        
        const role = response.data.user?.role || 'client';
        const redirectPath = roleRedirects[role] || '/';
        console.log('Перенаправление на:', redirectPath);
        
        navigate(redirectPath);
      } else {
        setError('Неверный ответ от сервера');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Ошибка сервера');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper sx={{ p: 4, maxWidth: 400 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Вход в систему</Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Имя пользователя"
            margin="normal"
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            required
          />
          <TextField
            fullWidth
            label="Пароль"
            type="password"
            margin="normal"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            required
          />
          <Button 
            fullWidth 
            variant="contained" 
            type="submit"
            sx={{ mt: 3 }}
          >
            Войти
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link 
              component="button"
              variant="body2"
              onClick={() => navigate('/register')}
            >
              Нет аккаунта? Зарегистрироваться
            </Link>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Login; 