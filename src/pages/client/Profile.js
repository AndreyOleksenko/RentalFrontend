import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Grid, 
  List, 
  ListItem, 
  ListItemText,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress
} from '@mui/material';
import DiscountsPanel from './DiscountsPanel';
import PenaltiesPanel from './PenaltiesPanel';
import { userService } from '../../services/api';
import { format } from 'date-fns';

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editProfile, setEditProfile] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [rentals, setRentals] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [completedRentalsThisMonth, setCompletedRentalsThisMonth] = useState(0);
  const [currentDiscount, setCurrentDiscount] = useState(0);

  const fetchProfile = async () => {
    try {
        const profileRes = await userService.getProfile();
        console.log('Полученные данные профиля:', profileRes.data);
        setProfile(profileRes.data);
    } catch (err) {
        console.error('Ошибка при загрузке профиля:', err);
    }
}; 

  const fetchPenalties = async () => {
    try {
      const penaltiesRes = await userService.getPenalties();
      console.log('Данные штрафов с сервера:', penaltiesRes.data);
      setPenalties(penaltiesRes.data);
    } catch (err) {
      console.error('Ошибка при загрузке штрафов:', err);
    }
  };

  const fetchRentals = async () => {
    try {
      const rentalsRes = await userService.getRentals();
      console.log('Данные аренд с сервера:', rentalsRes.data);
      setRentals(rentalsRes.data);
      
      // Подсчет завершенных аренд в текущем месяце
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const completedThisMonth = rentalsRes.data.filter(rental => {
        if (rental.status !== 'completed') return false;
        
        // Если возвратная дата есть, используем ее
        const returnDate = rental.return_date ? new Date(rental.return_date) : null;
        if (!returnDate) return false;
        
        return returnDate.getMonth() === currentMonth && 
               returnDate.getFullYear() === currentYear;
      }).length;
      
      setCompletedRentalsThisMonth(completedThisMonth);
    } catch (err) {
      console.error('Ошибка при загрузке аренд:', err);
    }
  };

  const fetchDiscount = async () => {
    try {
      const response = await userService.getUserDiscount();
      setCurrentDiscount(response.data.discount);
    } catch (error) {
      console.error('Ошибка при загрузке скидки:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchProfile();
        await fetchPenalties();
        await fetchRentals();
        await fetchDiscount();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = () => {
    console.log('Текущие данные профиля перед редактированием:', profile);
    setEditProfile({ ...profile });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      console.log('Отправляем на сервер данные профиля:', editProfile);
      await userService.updateProfile(editProfile);
      setProfile(editProfile);
      setIsDialogOpen(false);
      showNotification('Профиль успешно обновлен', 'success');
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      showNotification('Не удалось обновить профиль', 'error');
    }
  };

  const handleChange = (field) => (event) => {
    setEditProfile({
      ...editProfile,
      [field]: event.target.value
    });
  };

  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const handlePayPenalty = async (penaltyId) => {
    try {
      await userService.payPenalty(penaltyId);
      showNotification('Штраф успешно оплачен', 'success');
      // Обновляем список штрафов
      await fetchPenalties();
    } catch (error) {
      console.error('Ошибка при оплате штрафа:', error);
      showNotification('Не удалось оплатить штраф', 'error');
    }
  };

  // Обновляем функцию formatDate, чтобы она корректно обрабатывала даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    
    try {
      const date = new Date(dateString);
      // Проверяем, что дата валидна
      if (isNaN(date.getTime())) return 'Не указано';
      
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Ошибка при форматировании даты:', error, dateString);
      return 'Не указано';
    }
  };

  // Получение статуса аренды на русском
  const getRentalStatus = (status) => {
    const statuses = {
      'active': 'Активна',
      'completed': 'Завершена',
      'cancelled': 'Отменена',
      'pending': 'Ожидает подтверждения',
      'approved': 'Подтверждена',
      'rejected': 'Отклонена',
    };
    return statuses[status] || status;
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>Профиль пользователя</Typography>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleEditClick}>
            Редактировать профиль
          </Button>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <List>
              <ListItem>
                <ListItemText primary="Имя пользователя" secondary={profile.username} />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="ФИО" 
                  secondary={profile.full_name || `${profile.first_name || ''} ${profile.middle_name || ''} ${profile.last_name || ''}`.trim() || 'Не указано'} 
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Email" secondary={profile.email || 'Не указано'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Телефон" secondary={profile.phone || 'Не указано'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Адрес" secondary={profile.address || 'Не указано'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Номер паспорта" secondary={profile.passport_number || 'Не указано'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Водительское удостоверение" secondary={profile.driver_license || 'Не указано'} />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* История аренд */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>История аренд</Typography>
        {rentals.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Автомобиль</TableCell>
                  <TableCell>Дата начала</TableCell>
                  <TableCell>Дата окончания</TableCell>
                  <TableCell>Дата возврата</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Стоимость</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell>{`${rental.car_details?.brand} ${rental.car_details?.model}`}</TableCell>
                    <TableCell>{formatDate(rental.start_date)}</TableCell>
                    <TableCell>{formatDate(rental.end_date)}</TableCell>
                    <TableCell>{rental.return_date ? formatDate(rental.return_date) : 'Не указано'}</TableCell>
                    <TableCell>{getRentalStatus(rental.status)}</TableCell>
                    <TableCell>{`${rental.total_price} ₽`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary">
            У вас пока нет истории аренд
          </Typography>
        )}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <DiscountsPanel 
            completedRentalsThisMonth={completedRentalsThisMonth} 
            currentDiscount={currentDiscount}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PenaltiesPanel 
            penalties={penalties} 
            onPayPenalty={handlePayPenalty} 
          />
        </Grid>
      </Grid>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактирование профиля</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="ФИО"
            type="text"
            fullWidth
            value={editProfile.full_name || ''}
            onChange={(e) => setEditProfile({...editProfile, full_name: e.target.value})}
            helperText="Введите полное имя в формате: Имя Отчество Фамилия"
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={editProfile.email || ''}
            onChange={(e) => setEditProfile({...editProfile, email: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Телефон"
            type="text"
            fullWidth
            value={editProfile.phone || ''}
            onChange={(e) => setEditProfile({...editProfile, phone: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Адрес"
            type="text"
            fullWidth
            value={editProfile.address || ''}
            onChange={(e) => setEditProfile({...editProfile, address: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Номер паспорта"
            type="text"
            fullWidth
            value={editProfile.passport_number || ''}
            onChange={(e) => setEditProfile({...editProfile, passport_number: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Водительское удостоверение"
            type="text"
            fullWidth
            value={editProfile.driver_license || ''}
            onChange={(e) => setEditProfile({...editProfile, driver_license: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleSave} color="primary">Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile; 