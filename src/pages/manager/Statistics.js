import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ru } from 'date-fns/locale';
import { statisticsService } from '../../services/api';

const Statistics = () => {
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({
    start_date: null,
    end_date: null
  });
  const [statistics, setStatistics] = useState({
    summary: {
      totalRevenue: 0,
      totalRentals: 0,
      averageRentalDuration: 0,
      fleetUtilization: 0,
      maintenanceCosts: 0
    },
    revenueData: [],
    popularCars: []
  });

  useEffect(() => {
    fetchStatistics();
  }, [period, dateRange]);

  const fetchStatistics = async () => {
    try {
      console.log('Запрос статистики с параметрами:', { period, ...dateRange });
      const response = await statisticsService.getStatistics({
        period,
        ...dateRange
      });
      console.log('Получены данные статистики:', response.data);
      
      // Преобразуем данные из API в формат, ожидаемый компонентом
      const apiData = response.data;
      
      // Создаем объект с данными для отображения
      const formattedData = {
        summary: {
          totalRevenue: apiData.total_income || 0,
          totalRentals: apiData.total_rentals || apiData.labels?.length || 0,
          averageRentalDuration: apiData.average_rental_duration || 0,
          fleetUtilization: apiData.fleet_utilization || 0,
          maintenanceCosts: apiData.total_maintenance_costs || 0
        },
        revenueData: apiData.labels?.map((label, index) => ({
          date: label,
          доход: apiData.income_data?.[index] || 0,
          расход: apiData.expense_data?.[index] || 0
        })) || [],
        popularCars: apiData.popular_cars || []
      };
      
      console.log('Преобразованные данные:', formattedData);
      setStatistics(formattedData);
    } catch (error) {
      console.error('Ошибка при получении статистики:', error);
      alert('Ошибка при получении статистики. Пожалуйста, попробуйте позже.');
    }
  };

  const handleExportReport = async () => {
    try {
      console.log('Запрос на генерацию отчета с параметрами:', { period, ...dateRange });
      const response = await statisticsService.generateReport({
        period,
        ...dateRange
      });
      
      console.log('Получен ответ на запрос отчета:', response);
      
      // Получаем имя файла из заголовка Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'Налоговый отчет.docx';
      
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
        
        // Проверяем наличие filename* (RFC5987)
        const filenameStarRegex = /filename\*=UTF-8''([^;\n]*)/;
        const starMatches = filenameStarRegex.exec(contentDisposition);
        if (starMatches != null && starMatches[1]) {
          filename = decodeURIComponent(starMatches[1]);
        }
      }
      
      console.log('Имя файла для скачивания:', filename);
      
      // Создаем ссылку для скачивания файла
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Очищаем ссылку
      window.URL.revokeObjectURL(url);
      link.remove();
    } catch (error) {
      console.error('Ошибка при генерации отчета:', error);
      alert('Не удалось сгенерировать отчет. Пожалуйста, попробуйте позже.');
    }
  };

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  const handleDateChange = (field, date) => {
    setDateRange(prev => ({
      ...prev,
      [field]: date
    }));
  };

  // Форматирование чисел для отображения в рублях
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Статистика и аналитика</Typography>
        
        {/* Фильтры */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Период</InputLabel>
            <Select
              value={period}
              label="Период"
              onChange={handlePeriodChange}
            >
              <MenuItem value="week">Неделя</MenuItem>
              <MenuItem value="month">Месяц</MenuItem>
              <MenuItem value="half_year">Полгода</MenuItem>
              <MenuItem value="year">Год</MenuItem>
            </Select>
          </FormControl>
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <DatePicker
              label="Начальная дата"
              value={dateRange.start_date}
              onChange={(date) => handleDateChange('start_date', date)}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <DatePicker
              label="Конечная дата"
              value={dateRange.end_date}
              onChange={(date) => handleDateChange('end_date', date)}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          
          <Button 
            variant="contained" 
            onClick={handleExportReport}
            sx={{ ml: 'auto' }}
          >
            Сформировать налоговый отчет
          </Button>
        </Box>
        
        {/* Сводная информация */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Общая выручка</Typography>
              <Typography variant="h5">{formatCurrency(statistics.summary.totalRevenue)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Количество аренд</Typography>
              <Typography variant="h5">{statistics.summary.totalRentals}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Средняя длительность</Typography>
              <Typography variant="h5">{statistics.summary.averageRentalDuration} дней</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Загрузка автопарка</Typography>
              <Typography variant="h5">{statistics.summary.fleetUtilization}%</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Затраты на обслуживание</Typography>
              <Typography variant="h5">{formatCurrency(statistics.summary.maintenanceCosts)}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Графики */}
      <Grid container spacing={3}>
        {/* График выручки */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Динамика выручки
            </Typography>
            <LineChart
              width={1000}
              height={300}
              data={statistics.revenueData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="доход" name="Доход" stroke="#8884d8" />
              <Line type="monotone" dataKey="расход" name="Расход" stroke="#82ca9d" />
            </LineChart>
          </Paper>
        </Grid>

        {/* Популярные автомобили */}
        {statistics.popularCars.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Популярные автомобили
              </Typography>
              <BarChart
                width={1000}
                height={300}
                data={statistics.popularCars}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} аренд`} />
                <Legend />
                <Bar dataKey="rentals" name="Количество аренд" fill="#82ca9d" />
              </BarChart>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Statistics; 