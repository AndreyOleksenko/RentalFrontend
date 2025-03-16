import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  TextField,
  Alert
} from '@mui/material';
import { accountingService } from '../../services/api';
import DownloadIcon from '@mui/icons-material/Download';

const Accounting = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [penalties, setPenalties] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [penaltyStatus, setPenaltyStatus] = useState('all');
  const [penaltyPeriod, setPenaltyPeriod] = useState('month');
  const [statisticsData, setStatisticsData] = useState({
    labels: [],
    income_data: [],
    expense_data: [],
    total_income: 0,
    total_expense: 0,
    total_profit: 0
  });
  const [statisticsPeriod, setStatisticsPeriod] = useState('month');
  const [includePenalties, setIncludePenalties] = useState(false);
  const [taxReportPeriod, setTaxReportPeriod] = useState('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Используем реальные данные
  const useDummyData = false;

  useEffect(() => {
    console.log('Accounting component mounted, active tab:', activeTab);
    if (activeTab === 0) {
      fetchPenalties();
    } else if (activeTab === 1) {
      fetchStatistics();
    }
  }, [activeTab, penaltyStatus, penaltyPeriod, statisticsPeriod, includePenalties]);

  const fetchPenalties = async () => {
    console.log('Fetching penalties with status:', penaltyStatus, 'and period:', penaltyPeriod);
    setLoading(true);
    setError(null);
    
    if (useDummyData) {
      // Используем тестовые данные
      console.log('Using dummy penalties data');
      setTimeout(() => {
        const dummyPenalties = [
          { id: 1, description: 'Повреждение автомобиля', amount: 5000, created_at: '2023-05-15T10:30:00', paid_at: '2023-05-20T14:45:00', is_paid: true },
          { id: 2, description: 'Просроченный возврат', amount: 2500, created_at: '2023-06-10T08:15:00', paid_at: null, is_paid: false },
          { id: 3, description: 'Штраф за курение в салоне', amount: 3000, created_at: '2023-07-05T16:20:00', paid_at: '2023-07-10T11:30:00', is_paid: true }
        ];
        setPenalties(dummyPenalties);
        setTotalPaid(8000);
        setLoading(false);
      }, 500);
      return;
    }
    
    try {
      const response = await accountingService.getPenalties({
        status: penaltyStatus,
        period: penaltyPeriod
      });
      console.log('Penalties response:', response.data);
      setPenalties(response.data.penalties);
      setTotalPaid(response.data.total_paid);
    } catch (error) {
      console.error('Failed to fetch penalties:', error);
      setError('Ошибка при загрузке штрафов. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    console.log('Fetching statistics with period:', statisticsPeriod, 'and includePenalties:', includePenalties);
    setLoading(true);
    setError(null);
    
    if (useDummyData) {
      // Используем тестовые данные
      console.log('Using dummy statistics data');
      setTimeout(() => {
        const dummyStatistics = {
          labels: ['01.05', '02.05', '03.05', '04.05', '05.05'],
          income_data: [15000, 22000, 18000, 25000, 30000],
          expense_data: [5000, 8000, 6000, 9000, 12000],
          total_income: 110000,
          total_expense: 40000,
          total_profit: 70000
        };
        setStatisticsData(dummyStatistics);
        setLoading(false);
      }, 500);
      return;
    }
    
    try {
      const response = await accountingService.getStatistics({
        period: statisticsPeriod,
        include_penalties: includePenalties
      });
      console.log('Statistics response:', response.data);
      setStatisticsData(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      setError('Ошибка при загрузке статистики. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTaxReport = async () => {
    console.log('Generating tax report for period:', taxReportPeriod);
    setLoading(true);
    setError(null);
    
    if (useDummyData) {
      // Просто показываем сообщение об успехе
      console.log('Using dummy tax report generation');
      setTimeout(() => {
        alert('Отчет был бы сгенерирован, если бы API работал. Период: ' + taxReportPeriod);
        setLoading(false);
      }, 500);
      return;
    }
    
    try {
      console.log('Отправка запроса на получение налогового отчета...');
      const response = await accountingService.getTaxReport({
        period: taxReportPeriod
      });
      
      console.log('Получен ответ от сервера:', response);
      console.log('Тип данных ответа:', typeof response.data);
      console.log('Размер данных:', response.data.size || 'неизвестно');
      console.log('Заголовки:', response.headers);
      
      // Проверяем, что получили данные
      if (!response.data || response.data.size === 0) {
        throw new Error('Получен пустой ответ от сервера');
      }
      
      // Создаем ссылку для скачивания файла
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Получаем имя файла из заголовка Content-Disposition, если возможно
      let filename = `Налоговый отчет ${taxReportPeriod === 'month' ? 'за месяц' : 
                      taxReportPeriod === 'quarter' ? 'за квартал' : 'за год'}.docx`;
      
      // Используем имя файла из ответа сервера, если оно есть
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        console.log('Content-Disposition:', contentDisposition);
        
        // Пробуем извлечь имя файла из заголовка filename*=UTF-8''...
        const filenameStarRegex = /filename\*=UTF-8''([^;]*)/i;
        const starMatches = filenameStarRegex.exec(contentDisposition);
        if (starMatches && starMatches[1]) {
          try {
            // Декодируем URL-encoded UTF-8 строку
            filename = decodeURIComponent(starMatches[1]);
            console.log('Извлеченное UTF-8 имя файла:', filename);
          } catch (e) {
            console.error('Ошибка декодирования имени файла:', e);
          }
        } else {
          // Пробуем извлечь имя файла из обычного заголовка filename="..."
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(contentDisposition);
          if (matches != null && matches[1]) {
            // Удаляем кавычки, если они есть
            filename = matches[1].replace(/['"]/g, '');
            console.log('Извлеченное имя файла:', filename);
          }
        }
      }
      
      console.log('Итоговое имя файла для скачивания:', filename);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      console.log('Файл успешно скачан');
    } catch (error) {
      console.error('Ошибка при генерации налогового отчета:', error);
      console.error('Детали ошибки:', error.response || error.message || error);
      setError(`Ошибка при формировании налогового отчета: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    console.log('Tab changed to:', newValue);
    setActiveTab(newValue);
  };

  const getPenaltyStatusChip = (isPaid) => {
    return isPaid ? 
      <Chip label="Оплачен" color="success" size="small" /> : 
      <Chip label="Не оплачен" color="error" size="small" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(value);
  };

  const chartData = {
    labels: statisticsData.labels,
    datasets: [
      {
        label: 'Доходы',
        data: statisticsData.income_data,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      },
      {
        label: 'Расходы',
        data: statisticsData.expense_data,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Доходы и расходы'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const renderPenaltiesTab = () => (
    <Box sx={{ mt: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Штрафы</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={penaltyStatus}
              label="Статус"
              onChange={(e) => setPenaltyStatus(e.target.value)}
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="paid">Оплаченные</MenuItem>
              <MenuItem value="unpaid">Неоплаченные</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Период</InputLabel>
            <Select
              value={penaltyPeriod}
              label="Период"
              onChange={(e) => setPenaltyPeriod(e.target.value)}
            >
              <MenuItem value="week">Неделя</MenuItem>
              <MenuItem value="month">Месяц</MenuItem>
              <MenuItem value="half_year">Полгода</MenuItem>
              <MenuItem value="all">Все время</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Общая сумма оплаченных штрафов: {formatCurrency(totalPaid)}
        </Typography>
      </Paper>

      {loading ? (
        <Typography>Загрузка данных...</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell>Дата оплаты</TableCell>
              <TableCell>Статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {penalties.length > 0 ? (
              penalties.map((penalty) => (
                <TableRow key={penalty.id}>
                  <TableCell>{penalty.id}</TableCell>
                  <TableCell>{penalty.description}</TableCell>
                  <TableCell>{formatCurrency(penalty.amount)}</TableCell>
                  <TableCell>{formatDate(penalty.created_at)}</TableCell>
                  <TableCell>{formatDate(penalty.paid_at)}</TableCell>
                  <TableCell>{getPenaltyStatusChip(penalty.is_paid)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Нет данных о штрафах за выбранный период
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Box>
  );

  const renderStatisticsTab = () => (
    <Box sx={{ mt: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Статистика доходов и расходов</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Период</InputLabel>
            <Select
              value={statisticsPeriod}
              label="Период"
              onChange={(e) => setStatisticsPeriod(e.target.value)}
            >
              <MenuItem value="week">Неделя</MenuItem>
              <MenuItem value="month">Месяц</MenuItem>
              <MenuItem value="half_year">Полгода</MenuItem>
              <MenuItem value="year">Год</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={includePenalties}
                onChange={(e) => setIncludePenalties(e.target.checked)}
              />
            }
            label="Учитывать штрафы"
          />
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Общий доход</Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(statisticsData.total_income)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Общий расход</Typography>
              <Typography variant="h4" color="error">
                {formatCurrency(statisticsData.total_expense)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Прибыль</Typography>
              <Typography variant="h4" color={statisticsData.total_profit >= 0 ? 'success.main' : 'error'}>
                {formatCurrency(statisticsData.total_profit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Typography>Загрузка данных...</Typography>
      ) : (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Данные по периодам</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Период</TableCell>
                <TableCell>Доходы</TableCell>
                <TableCell>Расходы</TableCell>
                <TableCell>Прибыль</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statisticsData.labels.length > 0 ? (
                statisticsData.labels.map((label, index) => (
                  <TableRow key={index}>
                    <TableCell>{label}</TableCell>
                    <TableCell>{formatCurrency(statisticsData.income_data[index])}</TableCell>
                    <TableCell>{formatCurrency(statisticsData.expense_data[index])}</TableCell>
                    <TableCell>{formatCurrency(statisticsData.income_data[index] - statisticsData.expense_data[index])}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Нет данных за выбранный период
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );

  const renderTaxReportTab = () => (
    <Box sx={{ mt: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Typography variant="h6" gutterBottom>Формирование налогового отчета</Typography>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Период отчета</InputLabel>
            <Select
              value={taxReportPeriod}
              label="Период отчета"
              onChange={(e) => setTaxReportPeriod(e.target.value)}
            >
              <MenuItem value="month">Месяц</MenuItem>
              <MenuItem value="quarter">Квартал</MenuItem>
              <MenuItem value="year">Год</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleGenerateTaxReport}
            disabled={loading}
          >
            Сформировать отчет
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Отчет будет содержать информацию о доходах, расходах и налогах за выбранный период.
          Документ будет сформирован в формате Word и автоматически скачан.
        </Typography>
      </Paper>
    </Box>
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Бухгалтерия</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Штрафы" />
          <Tab label="Статистика" />
          <Tab label="Налоговый отчет" />
        </Tabs>
      </Box>
      {activeTab === 0 && renderPenaltiesTab()}
      {activeTab === 1 && renderStatisticsTab()}
      {activeTab === 2 && renderTaxReportTab()}
    </Container>
  );
};

export default Accounting; 