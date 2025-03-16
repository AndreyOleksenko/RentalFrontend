import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextField, Alert, Checkbox, FormGroup, Paper, Grid, Box, Chip } from '@mui/material';
import { userService } from '../../services/api';
import { format, isBefore } from 'date-fns';

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState(null);
  const [damageLevel, setDamageLevel] = useState('');
  const [fuelLevel, setFuelLevel] = useState('');
  const [hasDamage, setHasDamage] = useState(false);
  const [penalties, setPenalties] = useState([]);
  const [notification, setNotification] = useState('');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const fetchRentals = async () => {
    try {
      const response = await userService.getRentals();
      // Фильтруем только активные аренды
      const activeRentals = response.data.filter(rental => rental.status === 'active');
      setRentals(activeRentals);
    } catch (error) {
      console.error('Не удалось загрузить аренды:', error);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleReturnCar = (rental) => {
    setSelectedRental(rental);
    setFuelLevel('');
    setDamageLevel('');
    setHasDamage(false);
  };

  const handleShowDetails = (rental) => {
    setSelectedRental(rental);
    setShowDetailsDialog(true);
  };

  // Функция для перевода уровня повреждения на русский
  const getDamageLevelInRussian = (level) => {
    const levels = {
      'minor': 'незначительные',
      'medium': 'средние',
      'severe': 'серьезные',
      'none': 'отсутствуют'
    };
    return levels[level] || level;
  };

  const handleSubmitReturn = async () => {
    try {
      // Проверяем, что уровень топлива указан
      if (fuelLevel === '') {
        setNotification('Пожалуйста, укажите уровень топлива.');
        return;
      }

      // Если есть повреждения, проверяем, что указан уровень повреждений
      if (hasDamage && !damageLevel) {
        setNotification('Пожалуйста, укажите уровень повреждений.');
        return;
      }

      const damageLevelRussian = hasDamage ? getDamageLevelInRussian(damageLevel) : '';

      await userService.returnCar(selectedRental.id, {
        damage_level: hasDamage ? damageLevel : null,
        damage_level_russian: damageLevelRussian, // Добавляем русское название
        fuel_level: fuelLevel,
        return_condition: `Уровень топлива: ${fuelLevel}%. ${hasDamage ? `Повреждения: ${damageLevelRussian}` : 'Без повреждений'}`
      });
      
      // Обновляем список аренд после возврата
      await fetchRentals();
      setNotification('Машина успешно возвращена.');
      setSelectedRental(null);
    } catch (error) {
      console.error('Ошибка при завершении аренды:', error);
      setNotification('Ошибка при завершении аренды.');
    }
  };

  const handleCloseDialog = () => {
    setSelectedRental(null);
    setShowDetailsDialog(false);
    setNotification('');
  };

  // Компонент для отображения аренды с hover-эффектом
  const RentalItem = ({ rental, onShowDetails, onReturnCar }) => {
    const isOverdue = isBefore(new Date(rental.end_date), new Date());
    
    return (
      <Paper 
        sx={{ 
          p: 2, 
          mb: 2,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          backgroundColor: isOverdue ? 'rgba(255, 0, 0, 0.1)' : 'inherit',
          '&:hover': {
            backgroundColor: isOverdue ? 'rgba(255, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.04)',
            transform: 'scale(1.01)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            zIndex: 1
          }
        }}
        onClick={() => onShowDetails(rental)}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">
              {rental.car_details?.brand} {rental.car_details?.model}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Период аренды: {format(new Date(rental.start_date), 'dd/MM/yyyy')} - {format(new Date(rental.end_date), 'dd/MM/yyyy')}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            {isOverdue && <Alert severity="warning">Период аренды истек!</Alert>}
          </Grid>
          <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              onClick={(e) => {
                e.stopPropagation(); // Предотвращаем открытие деталей при клике на кнопку
                onReturnCar(rental);
              }}
            >
              Сдать машину
            </Button>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Мои активные аренды</Typography>
      {rentals.length > 0 ? (
        <Box>
          {rentals.map((rental) => (
            <RentalItem 
              key={rental.id} 
              rental={rental} 
              onShowDetails={handleShowDetails}
              onReturnCar={handleReturnCar}
            />
          ))}
        </Box>
      ) : (
        <Typography>У вас нет активных аренд</Typography>
      )}

      {/* Диалог с деталями аренды */}
      <Dialog 
        open={showDetailsDialog} 
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Информация об аренде #{selectedRental?.id}
        </DialogTitle>
        <DialogContent>
          {selectedRental && (
            <Grid container spacing={2} sx={{ pt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Автомобиль:</Typography>
                <Typography>
                  {selectedRental.car_details?.brand} {selectedRental.car_details?.model}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Статус:</Typography>
                <Chip 
                  label="Активна" 
                  color="success" 
                  size="small" 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Период аренды:</Typography>
                <Typography>
                  {format(new Date(selectedRental.start_date), 'dd/MM/yyyy')} - {format(new Date(selectedRental.end_date), 'dd/MM/yyyy')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Стоимость:</Typography>
                <Typography>{selectedRental.total_price} ₽</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Примененная скидка:</Typography>
                <Typography>{selectedRental.applied_discount || 0}%</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Информация о клиенте:</Typography>
                <Typography>ФИО: {selectedRental.personal_info?.full_name || 'Не указано'}</Typography>
                <Typography>Телефон: {selectedRental.personal_info?.phone || 'Не указано'}</Typography>
                <Typography>Email: {selectedRental.personal_info?.email || 'Не указано'}</Typography>
              </Grid>
              {isBefore(new Date(selectedRental.end_date), new Date()) && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    Период аренды истек! Пожалуйста, верните автомобиль как можно скорее.
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Закрыть</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              setShowDetailsDialog(false);
              handleReturnCar(selectedRental);
            }}
          >
            Сдать машину
          </Button>
        </DialogActions>
      </Dialog>

      {/* Существующий диалог для возврата машины */}
      <Dialog open={Boolean(selectedRental) && !showDetailsDialog} onClose={() => setSelectedRental(null)}>
        <DialogTitle>Возврат автомобиля</DialogTitle>
        <DialogContent>
          {notification && <Alert severity="info" sx={{ mb: 2 }}>{notification}</Alert>}
          
          <TextField
            label="Уровень топлива (%)"
            type="number"
            fullWidth
            margin="normal"
            value={fuelLevel}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (isNaN(value)) {
                setFuelLevel('');
              } else if (value < 0) {
                setFuelLevel('0');
              } else if (value > 100) {
                setFuelLevel('100');
              } else {
                setFuelLevel(value.toString());
              }
            }}
            InputProps={{ 
              inputProps: { 
                min: 0, 
                max: 100,
                step: 1
              } 
            }}
            helperText="Введите значение от 0 до 100"
            error={fuelLevel !== '' && (parseInt(fuelLevel) < 0 || parseInt(fuelLevel) > 100)}
          />
          
          <FormGroup>
            <FormControlLabel 
              control={<Checkbox checked={hasDamage} onChange={(e) => setHasDamage(e.target.checked)} />} 
              label="Есть повреждения" 
            />
          </FormGroup>
          
          {hasDamage && (
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Уровень повреждений</FormLabel>
              <RadioGroup value={damageLevel} onChange={(e) => setDamageLevel(e.target.value)}>
                <FormControlLabel value="minor" control={<Radio />} label="Незначительные (50% от стоимости аренды)" />
                <FormControlLabel value="medium" control={<Radio />} label="Средние (100% от стоимости аренды)" />
                <FormControlLabel value="severe" control={<Radio />} label="Серьезные (150% от стоимости аренды)" />
              </RadioGroup>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmitReturn} variant="contained" color="primary">Подтвердить возврат</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyRentals; 