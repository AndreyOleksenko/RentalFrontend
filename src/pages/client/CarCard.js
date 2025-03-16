import React, { useState } from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Button, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../utils/helpers';

const CarCard = ({ car }) => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const getStatusChip = (status) => {
    const statusMap = {
      'available': <Chip label="Доступна" color="success" />,
      'in_rent': <Chip label="В аренде" color="error" />,
      'maintenance': <Chip label="На обслуживании" color="warning" />,
      'pending': <Chip label="Ожидает подтверждения" color="info" />
    };
    return statusMap[status] || <Chip label="Доступна" color="success" />;
  };

  // Функция для перевода состояния на русский
  const translateCondition = (condition) => {
    const conditionMap = {
      'excellent': 'Отличное',
      'good': 'Хорошее',
      'fair': 'Удовлетворительное',
      'poor': 'Плохое',
      'needs_repair': 'Требует ремонта'
    };
    return conditionMap[condition] || condition;
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: 6,
            cursor: 'pointer'
          }
        }}
        onClick={() => setIsDialogOpen(true)}
      >
        <CardMedia
          component="img"
          height="200"
          image={getImageUrl(car.image)}
          alt={`${car.brand} ${car.model}`}
        />
        <CardContent>
          <Typography gutterBottom variant="h5">
            {car.brand} {car.model}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Год: {car.year}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Цена: {car.price_per_day}₽/день
          </Typography>
        </CardContent>
      </Card>

      {/* Диалоговое окно с подробной информацией */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {car.brand} {car.model} ({car.year})
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <img
                src={getImageUrl(car.image)}
                alt={`${car.brand} ${car.model}`}
                style={{ width: '100%', borderRadius: '8px' }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>Характеристики:</Typography>
              <Typography><strong>Состояние:</strong> {translateCondition(car.condition)}</Typography>
              <Typography><strong>Цена за день:</strong> {car.price_per_day}₽</Typography>
              <Typography><strong>Статус:</strong></Typography>
              {getStatusChip(car.status)}
              {car.description && (
                <Typography sx={{ mt: 2 }}>
                  <strong>Описание:</strong><br />
                  {car.description}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Закрыть</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setIsDialogOpen(false);
              navigate(`/rent/${car.id}`);
            }}
          >
            Арендовать
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CarCard;