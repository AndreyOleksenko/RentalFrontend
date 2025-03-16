import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  Alert,
  Grid,
  Checkbox,
  FormControlLabel,
  Card,
  CardMedia,
  Divider,
  TextField,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useParams, useNavigate } from 'react-router-dom';
import { carService, userService, rentalService } from '../../services/api';
import { differenceInDays, addDays, format } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { getImageUrl } from '../../utils/helpers';

const RentForm = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [car, setCar] = useState(null);
  const [error, setError] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [dateRange, setDateRange] = useState([null, null]);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    passportNumber: '',
    driverLicense: ''
  });
  const [formData, setFormData] = useState({
    agreeToPolicies: false
  });
  const [profileData, setProfileData] = useState(null);
  const [stepsCompleted, setStepsCompleted] = useState({
    personalInfo: false,
    dates: false
  });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carResponse, profileResponse] = await Promise.all([
          carService.getCar(carId),
          userService.getProfile()
        ]);
        setCar(carResponse.data);
        
        const profileInfo = {
          fullName: profileResponse.data.full_name || '',
          email: profileResponse.data.email || '',
          phone: profileResponse.data.phone || '',
          address: profileResponse.data.address || '',
          passportNumber: profileResponse.data.passport_number || '',
          driverLicense: profileResponse.data.driver_license || ''
        };

        setPersonalInfo(profileInfo);
        setProfileLoaded(true);

        const isComplete = profileInfo.fullName?.trim() && 
                          profileInfo.email?.trim() && 
                          profileInfo.phone?.trim() && 
                          profileInfo.address?.trim() && 
                          profileInfo.passportNumber?.trim() && 
                          profileInfo.driverLicense?.trim();

        if (isComplete) {
          setStepsCompleted(prev => ({
            ...prev,
            personalInfo: true
          }));
          setActiveStep(1);
        }
      } catch (error) {
        setError('Ошибка при загрузке данных');
        setProfileLoaded(true);
      }
    };
    fetchData();
  }, [carId]);

  useEffect(() => {
    if (dateRange[0] && dateRange[1] && car) {
      const days = differenceInDays(dateRange[1], dateRange[0]) + 1;
      if (days > 0) {
        setTotalPrice(days * car.price_per_day);
      }
    }
  }, [dateRange, car]);

  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const response = await userService.getUserDiscount();
        console.log('Получена скидка пользователя:', response.data);
        setDiscount(response.data.discount);
      } catch (error) {
        console.error('Ошибка при загрузке скидки:', error);
      }
    };
    
    fetchDiscount();
  }, []);

  useEffect(() => {
    if (car && dateRange[0] && dateRange[1]) {
      const days = differenceInDays(dateRange[1], dateRange[0]) + 1;
      const basePrice = car.price_per_day * days;
      
      if (discount > 0) {
        console.log(`Применяем скидку ${discount}% к базовой цене ${basePrice}`);
        const discountedPrice = basePrice * (1 - discount / 100);
        setTotalPrice(Math.round(discountedPrice));
      } else {
        setTotalPrice(basePrice);
      }
    }
  }, [car, dateRange, discount]);

  const handlePersonalInfoChange = (field) => (event) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const isPersonalInfoValid = () => {
    return Object.values(personalInfo).every(value => value.trim() !== '');
  };

  const handleNext = () => {
    if (activeStep === 0) {
      setStepsCompleted(prev => ({
        ...prev,
        personalInfo: isPersonalInfoComplete()
      }));
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    if (profileLoaded && isPersonalInfoComplete() && activeStep === 1) {
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const isPersonalInfoComplete = () => {
    const complete = Boolean(
      personalInfo.fullName?.trim() && 
      personalInfo.phone?.trim() && 
      personalInfo.email?.trim() && 
      personalInfo.address?.trim() && 
      personalInfo.passportNumber?.trim() && 
      personalInfo.driverLicense?.trim()
    );
    return complete;
  };

  useEffect(() => {
    const complete = isPersonalInfoComplete();
    if (complete && activeStep === 0) {
      setActiveStep(1);
    }
  }, [personalInfo, activeStep]);

  useEffect(() => {
    setStepsCompleted(prev => ({
      ...prev,
      dates: dateRange[0] && dateRange[1]
    }));
  }, [dateRange]);

  const downloadAgreement = async () => {
    try {
      const response = await carService.generateAgreement({
        car_id: carId,
        start_date: dateRange[0].toISOString().split('T')[0],
        end_date: dateRange[1].toISOString().split('T')[0],
        personal_info: personalInfo,
        total_price: totalPrice
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Договор аренды автомобиля.docx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Ошибка при генерации документа');
    }
  };

  const handleSubmit = async () => {
    if (!formData.agreeToPolicies) {
      setError('Необходимо согласиться с условиями аренды');
      return;
    }
    
    try {
      const rentalData = {
        car_id: carId,
        start_date: format(dateRange[0], 'yyyy-MM-dd'),
        end_date: format(dateRange[1], 'yyyy-MM-dd'),
        total_price: totalPrice,
        personal_info: personalInfo,
        applied_discount: discount
      };

      console.log('Отправка данных аренды:', rentalData);
      const response = await rentalService.createRental(rentalData);
      console.log('Получен ответ от сервера:', response);
      navigate('/profile');
    } catch (error) {
      console.error('Ошибка при создании аренды:', error);
      setError('Ошибка при создании аренды');
    }
  };

  const renderPersonalInfoField = (field, label, type = 'text') => {
    const value = personalInfo[field] || '';
    const isFieldFromProfile = profileData && profileData[field] && profileData[field].trim() !== '';

    return (
      <TextField
        fullWidth
        label={label}
        type={type}
        value={value}
        onChange={handlePersonalInfoChange(field)}
        required
        disabled={isFieldFromProfile}
        helperText={isFieldFromProfile ? 'Данные из профиля' : ''}
      />
    );
  };

  if (!car) return <Typography>Загрузка...</Typography>;

  const steps = ['Личные данные', 'Выбор дат', 'Подтверждение'];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {renderPersonalInfoField('fullName', 'ФИО')}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderPersonalInfoField('phone', 'Телефон')}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderPersonalInfoField('email', 'Email', 'email')}
            </Grid>
            <Grid item xs={12}>
              {renderPersonalInfoField('address', 'Адрес')}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderPersonalInfoField('passportNumber', 'Номер паспорта')}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderPersonalInfoField('driverLicense', 'Водительское удостоверение')}
            </Grid>
            {!isPersonalInfoValid() && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Заполните все пустые поля. Данные из вашего профиля уже подставлены автоматически.
                </Alert>
              </Grid>
            )}
          </Grid>
        );
      case 1:
        return (
          <Box sx={{ width: '100%' }}>
            <DateRangePicker
              calendars={1}
              value={dateRange}
              onChange={(newValue) => setDateRange(newValue)}
              minDate={new Date()}
              maxDate={addDays(new Date(), 90)}
              disablePast
            />
            {discount > 0 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Ваша персональная скидка: {discount}%
              </Alert>
            )}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Итоговая стоимость: {totalPrice}₽
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Период аренды: {dateRange[0] && dateRange[1] ? 
                `${differenceInDays(dateRange[1], dateRange[0]) + 1} дней` : 
                'Не выбран'}
            </Typography>
            <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>Стоимость аренды</Typography>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography>
                    Базовая стоимость: {car.price_per_day} ₽ × {differenceInDays(dateRange[1], dateRange[0]) + 1} дней = {car.price_per_day * (differenceInDays(dateRange[1], dateRange[0]) + 1)} ₽
                  </Typography>
                </Grid>
                {discount > 0 && (
                  <Grid item xs={12}>
                    <Typography color="success.main">
                      Скидка: {discount}% = {Math.round(car.price_per_day * (differenceInDays(dateRange[1], dateRange[0]) + 1) * discount / 100)} ₽
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="h6">
                    Итого: {totalPrice} ₽
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={downloadAgreement}
              sx={{ mt: 2, mb: 2 }}
            >
              Скачать договор
            </Button>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.agreeToPolicies}
                  onChange={(e) => setFormData({ ...formData, agreeToPolicies: e.target.checked })}
                />
              }
              label="Я согласен с условиями аренды"
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="300"
                image={getImageUrl(car.image)}
                alt={`${car.brand} ${car.model}`}
              />
            </Card>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h5">{car.brand} {car.model}</Typography>
              <Typography variant="body1" color="text.secondary">
                Год выпуска: {car.year}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Цена за день: {car.price_per_day}₽
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                {renderStepContent(activeStep)}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                    disabled={
                      !profileLoaded || 
                      activeStep === 0 || 
                      (activeStep === 1 && isPersonalInfoComplete())
                    }
                  >
                    Назад
                  </Button>
                  <Button
                    variant="contained"
                    onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                    disabled={
                      (activeStep === 0 && !isPersonalInfoComplete()) ||
                      (activeStep === 1 && !dateRange[0] && !dateRange[1]) ||
                      (activeStep === steps.length - 1 && !formData.agreeToPolicies)
                    }
                  >
                    {activeStep === steps.length - 1 ? 'Завершить' : 'Далее'}
                  </Button>
                </Box>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};

export default RentForm; 