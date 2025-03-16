import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { rentalService } from '../../services/api';

const Requests = () => {
  const [rentals, setRentals] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRental, setSelectedRental] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingRental, setRejectingRental] = useState(null);
  const [returnCondition, setReturnCondition] = useState('');

  useEffect(() => {
    fetchRentals();
  }, [statusFilter]);

  const fetchRentals = async () => {
    try {
      const response = await rentalService.getOperatorRentals(statusFilter);
      setRentals(response.data);
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
    }
  };

  const statusMap = {
    'pending': 'Ожидает подтверждения',
    'approved': 'Подтверждена',
    'active': 'Активная',
    'completed': 'Завершена',
    'cancelled': 'Отменена',
    'rejected': 'Отклонена'
  };

  const statusColors = {
    'pending': 'warning',
    'approved': 'info',
    'active': 'success',
    'completed': 'default',
    'cancelled': 'error',
    'rejected': 'error'
  };

  const getStatusChip = (status) => (
    <Chip 
      label={statusMap[status] || status}
      color={statusColors[status] || 'default'}
      size="small"
    />
  );

  const filterOptions = [
    { value: '', label: 'Все' },
    { value: 'pending', label: 'Ожидает подтверждения' },
    { value: 'active', label: 'Активные' },
    { value: 'completed', label: 'Завершенные' },
    { value: 'rejected', label: 'Отклоненные' }
  ];

  const handleApprove = async (id) => {
    try {
      await rentalService.approveRental(id);
      fetchRentals();
      setSelectedRental(null);
    } catch (error) {
      console.error('Failed to approve rental:', error);
    }
  };

  const handleReject = async () => {
    try {
      await rentalService.rejectRental(rejectingRental.id, { rejection_reason: rejectionReason });
      fetchRentals();
      setShowRejectDialog(false);
      setRejectingRental(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to reject rental:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    
    try {
      const date = new Date(dateString);
      // Проверяем, что дата валидна
      if (isNaN(date.getTime())) return 'Не указано';
      
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Ошибка при форматировании даты:', error, dateString);
      return 'Не указано';
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Заявки на аренду</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
          >
            {filterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Клиент</TableCell>
              <TableCell>Автомобиль</TableCell>
              <TableCell>Даты</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rentals.map((rental) => (
              <TableRow 
                key={rental.id}
                onClick={() => setSelectedRental(rental)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    transform: 'scale(1.01)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    zIndex: 1
                  }
                }}
              >
                <TableCell>
                  <Typography>{rental.user_details?.full_name || rental.personal_info?.full_name || 'Не указано'}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {rental.personal_info?.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  {`${rental.car_details?.brand} ${rental.car_details?.model}`}
                </TableCell>
                <TableCell>
                  {`${formatDate(rental.start_date)} - ${formatDate(rental.end_date)}`}
                </TableCell>
                <TableCell>{getStatusChip(rental.status)}</TableCell>
                <TableCell align="right">
                  {rental.status === 'pending' && (
                    <Box>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(rental.id);
                        }}
                        sx={{ mr: 1 }}
                      >
                        Подтвердить
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRejectingRental(rental);
                          setShowRejectDialog(true);
                        }}
                      >
                        Отклонить
                      </Button>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={Boolean(selectedRental)} 
        onClose={() => setSelectedRental(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Информация об аренде #{selectedRental?.id}
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>Информация о клиенте</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>ФИО:</strong> {selectedRental?.personal_info?.fullName || 'Не указано'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Телефон:</strong> {selectedRental?.personal_info?.phone || 'Не указано'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Email:</strong> {selectedRental?.personal_info?.email || 'Не указано'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Адрес:</strong> {selectedRental?.personal_info?.address || 'Не указано'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Паспорт:</strong> {selectedRental?.personal_info?.passportNumber || 'Не указано'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Водительское удостоверение:</strong> {selectedRental?.personal_info?.driverLicense || 'Не указано'}
              </Typography>
            </Grid>
          </Grid>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Информация об аренде</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Начало аренды:</strong> {formatDate(selectedRental?.start_date)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Окончание аренды:</strong> {formatDate(selectedRental?.end_date)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Дата возврата:</strong> {selectedRental?.return_date ? formatDate(selectedRental.return_date) : 'Не указано'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Статус:</strong> {getStatusChip(selectedRental?.status)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Стоимость:</strong> {selectedRental?.total_price} ₽
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Примененная скидка:</strong> {selectedRental?.applied_discount || 0}%
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)}>
        <DialogTitle>Отклонение заявки</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Причина отказа"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectDialog(false)}>Отмена</Button>
          <Button 
            onClick={handleReject}
            color="error"
            disabled={!rejectionReason.trim()}
          >
            Отклонить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Requests; 