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
  Box,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  PictureAsPdf,
  Info
} from '@mui/icons-material';
import { maintenanceService } from '../../services/api';

const CompletedWork = () => {
  const [completedWorks, setCompletedWorks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [statistics, setStatistics] = useState({
    totalWorks: 0,
    totalCost: 0,
    averageTime: 0
  });

  useEffect(() => {
    fetchCompletedWorks();
  }, [filter, dateRange]);

  const fetchCompletedWorks = async () => {
    try {
      const response = await maintenanceService.getCompletedWorks({
        filter,
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      setCompletedWorks(response.data.works);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Failed to fetch completed works:', error);
    }
  };

  const handleGenerateReport = async (workId) => {
    try {
      const response = await maintenanceService.generateWorkReport(workId);
      // Создаем blob и скачиваем PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `work-report-${workId}.pdf`;
      link.click();
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Всего работ</Typography>
              <Typography variant="h4">{statistics.totalWorks}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Общая стоимость</Typography>
              <Typography variant="h4">{statistics.totalCost} ₽</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Среднее время</Typography>
              <Typography variant="h4">{statistics.averageTime} ч</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Выполненные работы</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              type="date"
              label="С даты"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label="По дату"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ width: 200 }}
            >
              <MenuItem value="all">Все работы</MenuItem>
              <MenuItem value="repair">Ремонт</MenuItem>
              <MenuItem value="inspection">Осмотр</MenuItem>
              <MenuItem value="maintenance">ТО</MenuItem>
            </TextField>
          </Box>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Дата</TableCell>
              <TableCell>Автомобиль</TableCell>
              <TableCell>Тип работ</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell>Стоимость</TableCell>
              <TableCell>Время (ч)</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {completedWorks.map((work) => (
              <TableRow key={work.id}>
                <TableCell>
                  {new Date(work.completion_date).toLocaleDateString()}
                </TableCell>
                <TableCell>{`${work.car.brand} ${work.car.model}`}</TableCell>
                <TableCell>{work.type}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {work.description}
                    <Tooltip title={work.details}>
                      <IconButton size="small">
                        <Info fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>{work.cost} ₽</TableCell>
                <TableCell>{work.hours}</TableCell>
                <TableCell>
                  <Tooltip title="Скачать отчет">
                    <IconButton 
                      onClick={() => handleGenerateReport(work.id)}
                      size="small"
                    >
                      <PictureAsPdf />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default CompletedWork; 