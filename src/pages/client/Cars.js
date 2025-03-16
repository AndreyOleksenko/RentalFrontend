import React, { useState, useEffect } from 'react';
import { Container, Grid } from '@mui/material';
import { carService } from '../../services/api';
import CarCard from './CarCard';

const Cars = () => {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await carService.getAllCars();
      // Фильтруем только доступные машины
      const availableCars = response.data.filter(car => car.status === 'available');
      setCars(availableCars);
    } catch (error) {
      console.error('Failed to fetch cars:', error);
    }
  };

  return (
    <Container>
      <Grid container spacing={3}>
        {cars.map((car) => (
          <Grid item key={car.id} xs={12} sm={6} md={4}>
            <CarCard car={car} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Cars; 