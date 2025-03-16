import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { maintenanceService } from '../../services/api';

const Maintenance = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [cars, setCars] = useState([]);
  const [completedMaintenances, setCompletedMaintenances] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedCarHistory, setSelectedCarHistory] = useState([]);
  const [maintenanceForm, setMaintenanceForm] = useState({
    description: '',
    cost: ''
  });

  useEffect(() => {
    if (activeTab === 0) {
      fetchCarsInMaintenance();
    } else {
      fetchCompletedMaintenances();
    }
  }, [activeTab]);

  const fetchCarsInMaintenance = async () => {
    try {
      const response = await maintenanceService.getCarsInMaintenance();
      setCars(response.data);
      console.log('Данные о техническом обслуживании:', response.data);
    } catch (error) {
      console.error('Failed to fetch cars:', error);
    }
  };

  const fetchCompletedMaintenances = async () => {
    try {
      const response = await maintenanceService.getCompletedWorks({});
      setCompletedMaintenances(response.data);
      console.log('Автомобили с историей обслуживания:', response.data);
    } catch (error) {
      console.error('Failed to fetch completed maintenances:', error);
    }
  };

  const fetchCarHistory = async (carId) => {
    try {
      const response = await maintenanceService.getCarHistory(carId);
      setSelectedCarHistory(response.data);
      setHistoryDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch car history:', error);
    }
  };

  const handleAcceptMaintenance = async (maintenanceId) => {
    try {
      await maintenanceService.acceptMaintenance(maintenanceId);
      fetchCarsInMaintenance();
    } catch (error) {
      console.error('Failed to accept maintenance:', error);
    }
  };

  const handleCompleteMaintenance = async () => {
    try {
      if (!selectedCar || !selectedCar.id) {
        console.error('Не выбран автомобиль для завершения обслуживания');
        return;
      }
      
      // Проверяем, что стоимость не отрицательная
      const cost = parseFloat(maintenanceForm.cost);
      if (isNaN(cost) || cost < 0) {
        alert('Стоимость ремонта не может быть отрицательной или некорректной');
        return;
      }
      
      // Находим запись о техническом обслуживании для выбранного автомобиля
      const maintenance = cars.find(m => m.car_details?.id === selectedCar.id);
      
      if (!maintenance) {
        console.error('Не найдена запись о техническом обслуживании для выбранного автомобиля');
        return;
      }
      
      console.log('Завершение обслуживания:', maintenance.id, maintenanceForm);
      
      await maintenanceService.completeMaintenance(maintenance.id, maintenanceForm);
      setDialogOpen(false);
      fetchCarsInMaintenance();
    } catch (error) {
      console.error('Failed to complete maintenance:', error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Ошибка: ${error.response.data.error}`);
      } else {
        alert('Произошла ошибка при завершении обслуживания');
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'normal':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="В ожидании" color="warning" size="small" />;
      case 'in_progress':
        return <Chip label="В работе" color="info" size="small" />;
      case 'completed':
        return <Chip label="Завершено" color="success" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderActiveMaintenances = () => (
    <>
      {cars.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', my: 3 }}>
          Нет активных заявок на обслуживание
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Автомобиль</TableCell>
              <TableCell>Приоритет</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cars.map((maintenance) => (
              <TableRow key={maintenance.id}>
                <TableCell>{`${maintenance.car_details?.brand} ${maintenance.car_details?.model}`}</TableCell>
                <TableCell>
                  <Chip 
                    label={maintenance.priority === 'high' ? 'Высокий' : 'Обычный'}
                    color={getPriorityColor(maintenance.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {getStatusChip(maintenance.status)}
                </TableCell>
                <TableCell>
                  {maintenance.status === 'pending' && (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => handleAcceptMaintenance(maintenance.id)}
                    >
                      Принять в работу
                    </Button>
                  )}
                  {maintenance.status === 'in_progress' && (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => {
                        setSelectedCar(maintenance.car_details);
                        setMaintenanceForm({
                          description: '',
                          cost: ''
                        });
                        setDialogOpen(true);
                      }}
                    >
                      Завершить
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );

  const renderMaintenanceHistory = () => (
    <>
      {completedMaintenances.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', my: 3 }}>
          Нет истории обслуживания
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {completedMaintenances.map((car) => (
            <Grid item xs={12} sm={6} md={4} key={car.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    {car.brand} {car.model}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Год выпуска: {car.year}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Последнее обслуживание: {car.last_maintenance_date}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Текущее состояние: {car.condition === 'excellent' ? 'Отличное' : 
                                        car.condition === 'good' ? 'Хорошее' : 
                                        car.condition === 'satisfactory' ? 'Удовлетворительное' : 
                                        'Требует ремонта'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => fetchCarHistory(car.id)}
                  >
                    История обслуживания
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Активные заявки" />
            <Tab label="История обслуживания" />
          </Tabs>
        </Box>

        {activeTab === 0 ? renderActiveMaintenances() : renderMaintenanceHistory()}
      </Paper>

      <Dialog
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Завершение обслуживания</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Автомобиль: {selectedCar?.brand} {selectedCar?.model}
          </Typography>
          <TextField
            fullWidth
            label="Описание выполненных работ"
            multiline
            rows={4}
            value={maintenanceForm.description}
            onChange={(e) => setMaintenanceForm({
              ...maintenanceForm,
              description: e.target.value
            })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Стоимость работ"
            type="number"
            value={maintenanceForm.cost}
            onChange={(e) => {
              const value = e.target.value;
              // Разрешаем только положительные числа или пустую строку
              if (value === '' || parseFloat(value) >= 0) {
                setMaintenanceForm({
                  ...maintenanceForm,
                  cost: value
                });
              }
            }}
            inputProps={{ min: 0 }}
            margin="normal"
            required
            helperText="Стоимость не может быть отрицательной"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleCompleteMaintenance} 
            variant="contained"
            disabled={!maintenanceForm.description || !maintenanceForm.cost}
          >
            Завершить обслуживание
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={historyDialogOpen} 
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>История обслуживания автомобиля</DialogTitle>
        <DialogContent>
          {selectedCarHistory.length > 0 ? (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Автомобиль: {selectedCarHistory[0].car_details?.brand} {selectedCarHistory[0].car_details?.model}
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Дата</TableCell>
                    <TableCell>Дата завершения</TableCell>
                    <TableCell>Описание</TableCell>
                    <TableCell>Стоимость</TableCell>
                    <TableCell>Приоритет</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedCarHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.maintenance_date}</TableCell>
                      <TableCell>{item.completed_date || 'Не завершено'}</TableCell>
                      <TableCell>{item.description || 'Не указано'}</TableCell>
                      <TableCell>{item.cost} ₽</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.priority === 'high' ? 'Высокий' : 'Обычный'}
                          color={getPriorityColor(item.priority)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <Typography>Нет данных об обслуживании</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Maintenance; 