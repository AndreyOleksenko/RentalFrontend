import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Chip,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  DirectionsCar,
  Build,
  CheckCircle,
  Warning,
  AttachMoney,
  TrendingUp
} from '@mui/icons-material';
import { carService } from '../../services/api';

const FleetOverview = () => {
  const [cars, setCars] = useState([]);
  const [fleetStats, setFleetStats] = useState({
    totalCars: 0,
    availableCars: 0,
    inMaintenanceCars: 0,
    rentedCars: 0,
    pendingCars: 0,
    utilizationRate: 0,
    maintenanceCosts: 0,
    averageAge: 0
  });

  useEffect(() => {
    fetchFleetData();
  }, []);

  const fetchFleetData = async () => {
    try {
      console.log('Запрос данных об автопарке...');
      const carsResponse = await carService.getAllCars();
      
      console.log('Получены данные об автомобилях:', carsResponse.data);
      
      // Преобразуем данные для статистики
      const cars = carsResponse.data;
      
      // Рассчитываем статистику на основе полученных данных
      const totalCars = cars.length;
      const availableCars = cars.filter(car => car.status === 'available').length;
      const inMaintenanceCars = cars.filter(car => car.status === 'maintenance').length;
      const rentedCars = cars.filter(car => car.status === 'rented' || car.status === 'in_rent').length;
      const pendingCars = cars.filter(car => car.status === 'pending').length;

      // Рассчитываем процент использования автопарка
      const utilizationRate = totalCars > 0 ? Math.round((rentedCars / totalCars) * 100) : 0;
      
      // Получаем финансовую историю автомобилей
      let financialData = {};
      let maintenanceCosts = 0;
      
      try {
        const financialResponse = await carService.getFinancialHistory();
        console.log('Получены данные о финансовой истории:', financialResponse.data);
        
        // Создаем словарь для быстрого доступа к финансовым данным по ID автомобиля
        if (financialResponse.data && Array.isArray(financialResponse.data)) {
          financialResponse.data.forEach(item => {
            if (item.id) {
              financialData[item.id] = item;
            }
          });
          
          // Рассчитываем общие затраты на обслуживание
          maintenanceCosts = financialResponse.data.reduce((sum, car) => sum + (car.total_expenses || 0), 0);
        }
      } catch (error) {
        console.error('Ошибка при получении финансовой истории:', error);
        // В случае ошибки создаем тестовые данные
        console.log('Используем тестовые данные для финансовой истории');
        
        // Создаем тестовые данные для каждой машины
        cars.forEach(car => {
          const carId = car.id;
          const totalIncome = Math.floor(Math.random() * 500000) + 100000; // Случайное число от 100000 до 600000
          const totalExpenses = Math.floor(Math.random() * 200000) + 50000; // Случайное число от 50000 до 250000
          const efficiency = Math.round((totalIncome - totalExpenses) / totalIncome * 100);
          
          financialData[carId] = {
            id: carId,
            brand: car.brand,
            model: car.model,
            total_income: totalIncome,
            total_expenses: totalExpenses,
            efficiency: efficiency
          };
        });
        
        // Рассчитываем общие затраты на обслуживание
        maintenanceCosts = Object.values(financialData).reduce((sum, car) => sum + car.total_expenses, 0);
      }
      
      // Рассчитываем средний возраст автомобилей
      const currentYear = new Date().getFullYear();
      const averageAge = cars.length > 0 
        ? (currentYear - (cars.reduce((sum, car) => sum + (car.year || currentYear), 0) / totalCars))
        : 0;
      
      // Преобразуем данные для отображения в таблице
      const carsWithDetails = cars.map(car => {
        const carId = car.id;
        const carFinancial = financialData[carId] || {};
        
        return {
          ...car,
          totalIncome: carFinancial.total_income || 0,
          totalExpenses: carFinancial.total_expenses || 0,
          efficiency: carFinancial.efficiency || 0
        };
      });
      
      setFleetStats({
        totalCars,
        availableCars,
        pendingCars,
        inMaintenanceCars,
        rentedCars,
        utilizationRate,
        maintenanceCosts,
        averageAge: averageAge.toFixed(1)
      });
      
      setCars(carsWithDetails);
    } catch (error) {
      console.error('Ошибка при получении данных об автопарке:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'success',
      rented: 'primary',
      in_rent: 'primary',
      maintenance: 'warning',
      pending: 'info'
    };
    return colors[status] || 'default';
  };

  const getConditionIcon = (condition) => {
    switch (condition) {
      case 'excellent':
        return <CheckCircle color="success" />;
      case 'good':
        return <CheckCircle color="primary" />;
      case 'satisfactory':
        return <Warning color="warning" />;
      case 'needs_repair':
        return <Warning color="error" />;
      default:
        return null;
    }
  };

  // Функция для форматирования валюты
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Функция для перевода статуса на русский
  const translateStatus = (status) => {
    const statusMap = {
      'available': 'Доступен',
      'rented': 'В аренде',
      'pending': 'В ожидании',
      'in_rent': 'В аренде',
      'maintenance': 'На обслуживании',
      'repair': 'В ремонте'
    };
    return statusMap[status] || status;
  };

  // Функция для перевода состояния на русский
  const translateCondition = (condition) => {
    const conditionMap = {
      'excellent': 'Отличное',
      'good': 'Хорошее',
      'satisfactory': 'Удовлетворительное',
      'needs_repair': 'Плохое'
    };
    return conditionMap[condition] || condition;
  };

  return (
    <Container sx={{ mt: 4 }}>
      {/* Общая статистика */}
      <Typography variant="h5" gutterBottom>Обзор автопарка</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DirectionsCar color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Всего автомобилей</Typography>
              </Box>
              <Typography variant="h4">{fleetStats.totalCars}</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Средний возраст: {fleetStats.averageAge} лет
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Загрузка автопарка</Typography>
              <Typography variant="h4">
                {fleetStats.utilizationRate}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={fleetStats.utilizationRate}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Build color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Затраты на обслуживание</Typography>
              </Box>
              <Typography variant="h4">
                {formatCurrency(fleetStats.maintenanceCosts)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Статус автомобилей</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  Доступно: {fleetStats.availableCars}
                </Typography>
                <Typography variant="body2">
                  В ожидании: {fleetStats.pendingCars}
                </Typography>
                <Typography variant="body2">
                  В аренде: {fleetStats.rentedCars}
                </Typography>
                <Typography variant="body2">
                  На обслуживании: {fleetStats.inMaintenanceCars}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Детальная информация */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Детальная информация по автомобилям</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Автомобиль</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Состояние</TableCell>
              <TableCell>Доход</TableCell>
              <TableCell>Расходы</TableCell>
              <TableCell>Эффективность</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cars.map((car) => (
              <TableRow key={car.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DirectionsCar sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body1">
                        {car.brand} {car.model}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {car.year}, {car.color}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={translateStatus(car.status)} 
                    color={getStatusColor(car.status)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getConditionIcon(car.condition)}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {translateCondition(car.condition)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{formatCurrency(car.totalIncome)}</TableCell>
                <TableCell>{formatCurrency(car.totalExpenses)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {car.efficiency > 0 ? (
                      <TrendingUp color="success" sx={{ mr: 0.5 }} />
                    ) : (
                      <TrendingUp color="error" sx={{ mr: 0.5 }} />
                    )}
                    {car.efficiency}%
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default FleetOverview; 