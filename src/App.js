import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Страницы клиента
import Cars from './pages/client/Cars';
import Terms from './pages/client/Terms';
import Profile from './pages/client/Profile';
import RentForm from './pages/client/RentForm';
import MyRentals from './pages/client/MyRentals';

// Страницы оператора
import Fleet from './pages/operator/Fleet';
import Requests from './pages/operator/Requests';

// Страницы технического специалиста
import Maintenance from './pages/technician/Maintenance';
import CompletedWork from './pages/technician/CompletedWork';

// Страницы бухгалтера
import Accounting from './pages/accountant/Accounting';

// Страницы руководителя
import Statistics from './pages/manager/Statistics';
import FleetOverview from './pages/manager/FleetOverview';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Маршруты клиента */}
          <Route 
            path="/cars" 
            element={
              <PrivateRoute allowedRoles={['client']}>
                <Cars />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/terms" 
            element={
              <PrivateRoute allowedRoles={['client']}>
                <Terms />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute allowedRoles={['client']}>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/rent/:carId" 
            element={
              <PrivateRoute allowedRoles={['client']}>
                <RentForm />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/rentals" 
            element={
              <PrivateRoute allowedRoles={['client']}>
                <MyRentals />
              </PrivateRoute>
            } 
          />

          {/* Маршруты оператора */}
          <Route 
            path="/operator/fleet" 
            element={
              <PrivateRoute allowedRoles={['operator']}>
                <Fleet />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/operator/requests" 
            element={
              <PrivateRoute allowedRoles={['operator']}>
                <Requests />
              </PrivateRoute>
            } 
          />

          {/* Маршруты технического специалиста */}
          <Route 
            path="/technician/maintenance" 
            element={
              <PrivateRoute allowedRoles={['technician']}>
                <Maintenance />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/technician/completed" 
            element={
              <PrivateRoute allowedRoles={['technician']}>
                <CompletedWork />
              </PrivateRoute>
            } 
          />

          {/* Маршруты бухгалтера */}
          <Route 
            path="/accountant/accounting" 
            element={
              <PrivateRoute allowedRoles={['accountant']}>
                <Accounting />
              </PrivateRoute>
            } 
          />

          {/* Маршруты руководителя */}
          <Route 
            path="/manager/statistics" 
            element={
              <PrivateRoute allowedRoles={['manager']}>
                <Statistics />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/manager/fleet" 
            element={
              <PrivateRoute allowedRoles={['manager']}>
                <FleetOverview />
              </PrivateRoute>
            } 
          />

          {/* Редирект на страницу входа по умолчанию */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
