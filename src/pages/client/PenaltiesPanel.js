import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button
} from '@mui/material';

const PenaltiesPanel = ({ penalties, onPayPenalty }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Нет данных';
    
    try {
      // Форматируем дату с учетом часового пояса
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit', 
        timeZone: 'UTC'  // Используем UTC чтобы избежать смещения
      });
    } catch (error) {
      console.error('Ошибка при форматировании даты:', error);
      return 'Ошибка формата';
    }
  };

  // Функция для форматирования суммы
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '0.00₽';
    
    // Преобразуем в число, если это строка
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Проверяем, является ли результат числом
    if (isNaN(numAmount)) return '0.00₽';
    
    return `${numAmount.toFixed(2)}₽`;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Штрафы и нарушения
      </Typography>

      {penalties && penalties.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Дата</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {penalties.map((penalty) => (
                <TableRow key={penalty.id}>
                  <TableCell>{formatDate(penalty.created_at)}</TableCell>
                  <TableCell>{penalty.description}</TableCell>
                  <TableCell>{formatAmount(penalty.amount)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={penalty.is_paid ? 'Оплачен' : 'Не оплачен'}
                      color={penalty.is_paid ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {!penalty.is_paid && (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small"
                        onClick={() => onPayPenalty(penalty.id)}
                      >
                        Оплатить
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography color="text.secondary">
          У вас нет активных штрафов
        </Typography>
      )}
    </Paper>
  );
};

export default PenaltiesPanel;