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
      // Проверяем, что поля заполнены
      if (!credentials.username || !credentials.password) {
        setError('Пожалуйста, заполните имя пользователя и пароль');
        return;
      }
      
      console.log('Отправка запроса на вход с данными:', { 
        username: credentials.username, 
        password: '********' 
      });
      
      const response = await userService.login(credentials);
      console.log('Ответ от сервера при входе:', response.data);
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Проверяем, есть ли поле user.role в ответе
        let role = 'client'; // Роль по умолчанию
        
        if (response.data.user && response.data.user.role) {
          role = response.data.user.role;
          console.log('Роль пользователя установлена:', role);
        } else {
          console.log('Роль пользователя не найдена в ответе, установлена по умолчанию: client');
        }
        
        localStorage.setItem('role', role);
        
        // Редирект в зависимости от роли
        const roleRedirects = {
          'client': '/cars',
          'operator': '/operator/fleet',
          'technician': '/technician/maintenance',
          'accountant': '/accountant/accounting',
          'manager': '/manager/statistics'
        };
        
        const redirectPath = roleRedirects[role] || '/';
        console.log('Перенаправление на:', redirectPath);
        
        navigate(redirectPath);
      } else {
        console.error('Неверный формат ответа от сервера:', response.data);
        setError('Неверный ответ от сервера. Пожалуйста, попробуйте позже.');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Более подробная обработка ошибок
      if (error.response) {
        // Сервер вернул ответ со статусом отличным от 2xx
        console.error('Ошибка ответа сервера:', error.response.status, error.response.data);
        
        if (error.response.status === 400) {
          setError(error.response.data.error || 'Неверное имя пользователя или пароль');
        } else if (error.response.status === 500) {
          setError('Ошибка сервера. Пожалуйста, попробуйте позже.');
        } else {
          setError(`Ошибка: ${error.response.data.error || 'Что-то пошло не так'}`);
        }
      } else if (error.request) {
        // Запрос был сделан, но ответ не получен
        console.error('Нет ответа от сервера:', error.request);
        setError('Нет ответа от сервера. Проверьте подключение к интернету.');
      } else {
        // Что-то пошло не так при настройке запроса
        console.error('Ошибка запроса:', error.message);
        setError(`Ошибка: ${error.message}`);
      }
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