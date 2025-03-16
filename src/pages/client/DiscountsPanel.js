import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Box
} from '@mui/material';
import { Discount, Star } from '@mui/icons-material';

const DiscountsPanel = ({ completedRentalsThisMonth, currentDiscount }) => {
  const discountLevels = [
    { rentals: 3, discount: 5 },
    { rentals: 5, discount: 10 },
    { rentals: 10, discount: 15 },
    { rentals: 20, discount: 20 }
  ];

  // Находим следующий уровень скидки
  const getNextDiscountLevel = () => {
    return discountLevels
      .sort((a, b) => a.rentals - b.rentals)
      .find(level => level.rentals > completedRentalsThisMonth) || null;
  };

  const nextLevel = getNextDiscountLevel();
  
  // Если есть следующий уровень, вычисляем прогресс до него
  // Если нет, значит достигнут максимальный уровень
  const progress = nextLevel 
    ? (completedRentalsThisMonth / nextLevel.rentals) * 100 
    : 100;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Система скидок
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Текущая скидка: {currentDiscount}%
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Завершено аренд в этом месяце: {completedRentalsThisMonth}
        </Typography>
        {nextLevel && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              До следующей скидки ({nextLevel.discount}%): {nextLevel.rentals - completedRentalsThisMonth} аренд
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ mt: 1 }}
            />
          </>
        )}
      </Box>

      <List>
        {discountLevels.map((level) => (
          <ListItem key={level.rentals}>
            <ListItemIcon>
              {completedRentalsThisMonth >= level.rentals ? (
                <Star color="primary" />
              ) : (
                <Discount color="disabled" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={`${level.discount}% скидка`}
              secondary={`При ${level.rentals} завершенных арендах в месяц`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default DiscountsPanel; 