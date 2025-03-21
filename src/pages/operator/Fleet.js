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
  Chip,
  Button,
  Box,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { carService } from '../../services/api';

const Fleet = () => {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [filter, setFilter] = useState('all');
  const [editMode, setEditMode] = useState(false);
  const [editedCar, setEditedCar] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await carService.getAllCars();
      setCars(response.data);
    } catch (error) {
      console.error('Failed to fetch cars:', error);
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      'available': <Chip label="Доступна" color="success" />,
      'in_rent': <Chip label="В аренде" color="primary" />,
      'maintenance': <Chip label="На обслуживании" color="warning" />,
      'pending': <Chip label="Ожидает подтверждения" color="info" />
    };
    return statusMap[status] || <Chip label="Доступна" color="success" />;
  };

  const handleStatusChange = async (carId, newStatus) => {
    try {
      await carService.updateCarStatus(carId, { status: newStatus });
      fetchCars();
    } catch (error) {
      console.error('Failed to update car status:', error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      await carService.updateCar(editedCar.id, editedCar);
      fetchCars();
      setEditMode(false);
      setSelectedCar(null);
    } catch (error) {
      console.error('Failed to update car:', error);
    }
  };

  const handleMaintenanceRequest = async (carId) => {
    try {
      await carService.requestMaintenance(carId);
      fetchCars();
    } catch (error) {
      console.error('Failed to request maintenance:', error);
    }
  };

  const handleDeleteCar = async () => {
    try {
      await carService.deleteCar(carToDelete.id);
      fetchCars();
      setDeleteDialogOpen(false);
      setCarToDelete(null);
    } catch (error) {
      console.error('Failed to delete car:', error);
    }
  };

  const getStatusTranslation = (status) => {
    const statusMap = {
      'in_rent': 'В аренде',
      'maintenance': 'На обслуживании',
      'available': 'Доступна',
      'pending': 'Ожидает подтверждения'
    };
    return statusMap[status] || 'Доступна';
  };

  const getConditionTranslation = (condition) => {
    const conditionMap = {
      'excellent': 'Отличное',
      'good': 'Хорошее',
      'satisfactory': 'Удовлетворительное',
      'needs_repair': 'Требует ремонта'
    };
    return conditionMap[condition] || 'Отличное';
  };

  const filteredCars = filter === 'all' 
    ? cars 
    : cars.filter(car => {
        if (filter === 'rented') return car.status === 'in_rent';
        if (filter === 'available') return car.status === 'available';
        if (filter === 'maintenance') return car.status === 'maintenance';
        if (filter === 'pending') return car.status === 'pending';
        return car.status === filter;
      });

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Управление автопарком</Typography>
          <TextField
            select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="all">Все автомобили</MenuItem>
            <MenuItem value="available">Доступные</MenuItem>
            <MenuItem value="rented">В аренде</MenuItem>
            <MenuItem value="maintenance">На обслуживании</MenuItem>
          </TextField>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Автомобиль</TableCell>
              <TableCell>Характеристики</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCars.map((car) => (
              <TableRow key={car.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CarIcon sx={{ mr: 1 }} />
                    <div>
                      <Typography>{`${car.brand} ${car.model}`}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {car.year} год
                      </Typography>
                    </div>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography>Цена: {car.price_per_day}₽/день</Typography>
                  <Typography variant="caption">
                    Состояние: {getConditionTranslation(car.condition)}
                  </Typography>
                </TableCell>
                <TableCell>{getStatusChip(car.status)}</TableCell>
                <TableCell>
                  <Tooltip title="Редактировать">
                    <IconButton 
                      onClick={() => {
                        setSelectedCar(car);
                        setEditedCar({...car});
                        setEditMode(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {car.status === 'available' && (car.condition === 'satisfactory' || car.condition === 'needs_repair') && (
                    <Tooltip title="Отправить на обслуживание">
                      <IconButton 
                        onClick={() => handleMaintenanceRequest(car.id)}
                        color="warning"
                      >
                        <BuildIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {car.condition === 'needs_repair' && (
                    <Tooltip title="Требуется ремонт">
                      <WarningIcon color="error" />
                    </Tooltip>
                  )}
                  <Tooltip title="Удалить автомобиль">
                    <IconButton 
                      onClick={() => {
                        setCarToDelete(car);
                        setDeleteDialogOpen(true);
                      }}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog 
        open={editMode && selectedCar !== null} 
        onClose={() => {
          setEditMode(false);
          setSelectedCar(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Редактирование автомобиля
        </DialogTitle>
        <DialogContent>
          {editedCar && (
            <Grid container spacing={2} sx={{ pt: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Бренд"
                  value={editedCar.brand}
                  onChange={(e) => setEditedCar({...editedCar, brand: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Модель"
                  value={editedCar.model}
                  onChange={(e) => setEditedCar({...editedCar, model: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Год"
                  type="number"
                  value={editedCar.year}
                  onChange={(e) => setEditedCar({...editedCar, year: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Цена за день"
                  type="number"
                  value={editedCar.price_per_day}
                  onChange={(e) => setEditedCar({...editedCar, price_per_day: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Состояние"
                  value={getConditionTranslation(editedCar.condition)}
                  disabled
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Описание"
                  value={editedCar.description}
                  onChange={(e) => setEditedCar({...editedCar, description: e.target.value})}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditMode(false);
            setSelectedCar(null);
          }}>
            Отмена
          </Button>
          <Button 
            variant="contained"
            onClick={handleSaveChanges}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCarToDelete(null);
        }}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          {carToDelete && (
            <Typography>
              Вы действительно хотите удалить автомобиль {carToDelete.brand} {carToDelete.model}?
              Это действие нельзя будет отменить.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setCarToDelete(null);
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteCar}
            color="error"
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Fleet; 