import React, { useMemo, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BiddingPage from './pages/BiddingPage';
import EquipmentPage from './pages/EquipmentPage';
import GuidancePage from './pages/GuidancePage';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const [mode, setMode] = useState('light');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          background: {
            default: mode === 'dark' ? '#0f172a' : '#f5f7fa',
            paper: mode === 'dark' ? '#1e293b' : '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", sans-serif',
          fontSize: 15, // 👈 GLOBAL FONT SIZE BOOST
          h4: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
          body1: { fontSize: '1rem' },
          body2: { fontSize: '0.95rem' },
        },
        shape: {
          borderRadius: 12,
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar mode={mode} setMode={setMode} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/bidding" element={<BiddingPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/guidance" element={<GuidancePage />} />

        <Route
          path="/farmer-dashboard"
          element={
            <PrivateRoute roles={['farmer']}>
              <FarmerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/buyer-dashboard"
          element={
            <PrivateRoute roles={['buyer']}>
              <BuyerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
