import axios from 'axios';

// Создаем экземпляр axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://rentalbackend-x86y.onrender.com/api',  // Используем URL развернутого API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем перехватчик для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Перехватчик для обработки ответов
api.interceptors.response.use(
    response => {
        // Для ответов с типом blob возвращаем как есть
        if (response.config.responseType === 'blob') {
            return response;
        }
        return response;
    },
    error => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export const completeRental = async (rentalId, data) => {
  try {
    const response = await axios.post(`/api/rentals/${rentalId}/complete`, data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при завершении аренды:', error);
    throw error;
  }
};

export const carService = {
  getAllCars: () => api.get('/cars/'),
  getAvailableCars: () => api.get('/cars/'),
  getCar: (id) => 
    api.get(`/cars/${id}/`),
  rentCar: (rentalData) => 
    api.post('/rentals/', rentalData),
  generateAgreement: (data) => 
    api.post('/auth/generate-agreement/', data, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
      }
    }),
  updateCarStatus: (carId, data) => 
    api.patch(`/cars/${carId}/status/`, data),
  updateCar: (carId, data) => 
    api.patch(`/cars/${carId}/`, data),
  requestMaintenance: (carId) => 
    api.post(`/cars/${carId}/maintenance/`, {}),
  getRentalsHistory: () => 
    api.get('/rentals/?status=completed'),
  getMaintenanceHistory: () => 
    api.get('/maintenance/completed/'),
  getFinancialHistory: () => 
    api.get('/auth/cars/financial-history/')
};

export const userService = {
  login: (credentials) => {
    return api.post('/auth/login/', credentials);
  },
  register: (data) => {
    return api.post('/auth/register/', data);
  },
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile/');
      return response;
    } catch (error) {
      console.error('Ошибка при получении профиля:', error);
      throw error;
    }
  },
  getPenalties: () => 
    api.get('/auth/penalties/'),
  updateProfile: async (data) => {
    try {
      console.log('Отправка запроса на обновление профиля с данными:', data);
      const response = await api.put('/auth/profile/', data);
      console.log('Получен ответ от сервера после обновления:', response);
      return response;
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      throw error;
    }
  },
  getRentals: () => {
    return api.get('/rentals/');
  },
  completeRental: (rentalId, data) => {
    return api.post(`/api/rentals/${rentalId}/complete`, data);
  },
  returnCar: async (rentalId, data) => {
    try {
      // Используем правильный URL с именем метода return_car
      const response = await api.post(`/rentals/${rentalId}/return_car/`, data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при возврате автомобиля:', error);
      throw error;
    }
  },
  payPenalty: (penaltyId) => {
    return api.post(`/auth/penalties/${penaltyId}/pay/`);
  },
  getUserDiscount: () => api.get('/auth/user/discount/'),
};

export const rentalService = {
  createRental: (data) => {
    return api.post('/rentals/', data);
  },
  getRentals: () => {
    return api.get('/rentals/');
  },
  getOperatorRentals: (status = '') => {
    return api.get(`/operator/rentals/${status ? `?status=${status}` : ''}`);
  },
  approveRental: (id) => {
    return api.post(`/operator/rentals/${id}/approve/`);
  },
  rejectRental: (id, data) => {
    return api.post(`/operator/rentals/${id}/reject/`, data);
  },
  completeRental: (id, data) => {
    return api.post(`/operator/rentals/${id}/complete_return/`, data);
  },
  updateRentalStatus: (rentalId, data) => 
    api.patch(`/rentals/${rentalId}/status/`, data),
};

export const maintenanceService = {
  getCarsInMaintenance: () => api.get('/maintenance/cars/'),
  startMaintenance: (data) => api.post('/maintenance/', data),
  acceptMaintenance: (maintenanceId) => 
    api.post(`/maintenance/${maintenanceId}/accept/`),
  completeMaintenance: (maintenanceId, data) => 
    api.patch(`/maintenance/${maintenanceId}/complete/`, data),
  getCompletedWorks: (params) => 
    api.get('/maintenance/completed/', { params }),
  getCarHistory: (carId) => 
    api.get(`/maintenance/${carId}/history/`),
  generateWorkReport: (workId) => 
    api.get(`/maintenance/${workId}/report/`, {
      responseType: 'blob'
    }),
};

export const accountingService = {
  getSummary: (params) => 
    api.get('/accounting/summary/', { params }),
  getTransactions: (params) => 
    api.get('/accounting/transactions/', { params }),
  generateReport: (params) => 
    api.get('/accounting/report/', { 
      params,
      responseType: 'blob'
    }),
  getPenalties: (params) => 
    api.get('/accounting/penalties/', { params }),
  getStatistics: (params) => 
    api.get('/accounting/statistics/', { params }),
  getTaxReport: async (params) => {
    try {
      return await api.get('/accounting/tax_report/', { 
        params,
        responseType: 'blob',
        headers: {
          'Accept': '*/*'
        }
      });
    } catch (error) {
      console.error('Ошибка при получении налогового отчета:', error);
      throw error;
    }
  },
};

export const statisticsService = {
  getStatistics: (params) => 
    api.get('/accounting/statistics/', { params }),
  generateReport: (params) => 
    api.get('/accounting/tax_report/', { 
      params,
      responseType: 'blob'
    }),
};

export const fleetService = {
  getFleetStats: () => api.get('/cars/'),
  getFleetDetails: () => api.get('/cars/'),
};

export default api; 