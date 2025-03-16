import React, { useEffect, useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Box, 
  Container, 
  Typography, 
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import GavelIcon from '@mui/icons-material/Gavel';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Используем состояние для отслеживания аутентификации и роли
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  // Проверяем аутентификацию и роль при каждом рендере
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    console.log('Navbar: Проверка аутентификации');
    console.log('Токен:', token ? 'Есть' : 'Нет');
    console.log('Роль:', role || 'Не задана');
    console.log('Текущий путь:', location.pathname);
    
    setIsAuthenticated(!!token);
    setUserRole(token ? role : null);
  }, [location.pathname]); // Перепроверяем при изменении пути

  const getNavItems = () => {
    console.log('getNavItems вызван, isAuthenticated:', isAuthenticated, 'userRole:', userRole);
    
    // Если пользователь не аутентифицирован, показываем только кнопки входа и регистрации
    if (!isAuthenticated) {
      return (
        <>
          <Button color="inherit" onClick={() => navigate('/login')}>Вход</Button>
          <Button color="inherit" onClick={() => navigate('/register')}>Регистрация</Button>
        </>
      );
    }

    // Если пользователь аутентифицирован, показываем соответствующие кнопки в зависимости от роли
    switch (userRole) {
      case 'client':
        return (
          <>
            <Button color="inherit" onClick={() => navigate('/cars')}>Автомобили</Button>
            <Button color="inherit" onClick={() => navigate('/terms')}>Положения</Button>
            <Button color="inherit" onClick={() => navigate('/rentals')}>Мои аренды</Button>
            <Button color="inherit" onClick={() => navigate('/profile')}>Профиль</Button>
          </>
        );
      case 'operator':
        return (
          <>
            <Button color="inherit" onClick={() => navigate('/operator/fleet')}>Автопарк</Button>
            <Button color="inherit" onClick={() => navigate('/operator/requests')}>Заявки</Button>
          </>
        );
      case 'technician':
        return (
          <Button color="inherit" onClick={() => navigate('/technician/maintenance')}>Обслуживание</Button>
        );
      case 'accountant':
        return (
          <Button color="inherit" onClick={() => navigate('/accountant/accounting')}>Бухгалтерия</Button>
        );
      case 'manager':
        return (
          <>
            <Button color="inherit" onClick={() => navigate('/manager/statistics')}>Статистика</Button>
            <Button color="inherit" onClick={() => navigate('/manager/fleet')}>Автопарк</Button>
          </>
        );
      default:
        return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/login');
  };

  // Не отображаем навбар на страницах входа и регистрации
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center',
            mr: 4 
          }}>
            <DirectionsCarIcon sx={{ mr: 2 }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                color: 'inherit',
              }}
            >
              SewxrrCarRental
            </Typography>
          </Box>

          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="menu"
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              gap: 2,
              alignItems: 'center' 
            }}>
              {getNavItems()}
            </Box>
          )}

          {isAuthenticated && (
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                ml: 2
              }}
            >
              Выход
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 