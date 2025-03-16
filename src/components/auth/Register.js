import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box,
  Link,
  Alert
} from '@mui/material';
import { userService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Проверка паролей
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      // Регистрация пользователя
      const registerResponse = await userService.register({
        username: formData.username,
        password: formData.password
      });

      console.log('Регистрация успешна:', registerResponse.data);

      // После успешной регистрации входим
      try {
        const loginResponse = await userService.login({
          username: formData.username,
          password: formData.password
        });

        console.log('Вход успешен:', loginResponse.data);

        // Сохраняем токен
        if (loginResponse.data.token) {
          localStorage.setItem('token', loginResponse.data.token);
          
          // Получаем роль пользователя (по умолчанию 'client')
          const role = 'client';
          localStorage.setItem('role', role);
          
          // Перенаправляем на страницу автомобилей
          navigate('/cars');
        } else {
          setError('Неверный ответ от сервера при входе');
        }
      } catch (loginError) {
        console.error('Ошибка при входе после регистрации:', loginError);
        setError('Регистрация успешна, но не удалось войти автоматически. Пожалуйста, войдите вручную.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      if (error.response?.data) {
        // Проверяем, есть ли ошибки валидации для username
        if (error.response.data.username) {
          setError(`Ошибка с именем пользователя: ${error.response.data.username.join(', ')}`);
        } else {
          setError(JSON.stringify(error.response.data));
        }
      } else {
        setError('Ошибка при регистрации. Пожалуйста, попробуйте позже.');
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper sx={{ p: 4, maxWidth: 400 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Регистрация</Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Имя пользователя"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Пароль"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Подтверждение пароля"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
          />

          <Button 
            fullWidth 
            variant="contained" 
            type="submit"
            sx={{ mt: 3 }}
          >
            Зарегистрироваться
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link 
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
            >
              Уже есть аккаунт? Войти
            </Link>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Register; 