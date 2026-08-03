import React, { useMemo, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoadingScreen from './components/home/LoadingScreen';

import Navbar from './components/navigation/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BiddingPage from './pages/BiddingPage';
import EquipmentPage from './pages/EquipmentPage';
import GuidancePage from './pages/GuidancePage';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import About from './pages/About';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import { ToastContainer } from './components/ui';

function App() {
  const location = useLocation();
  const [mode, setMode] = useState('light');
  // Show loading screen once per browser session
  const [showLoader, setShowLoader] = useState(() => {
    try {
      return !sessionStorage.getItem('ag_loaded');
    } catch (e) {
      console.warn('sessionStorage is not accessible:', e);
      return false;
    }
  });
  const handleLoaderDone = () => {
    try {
      sessionStorage.setItem('ag_loaded', '1');
    } catch (e) {
      console.warn('sessionStorage set failed:', e);
    }
    setShowLoader(false);
  };

  React.useEffect(() => {
    if (mode === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1FA64B',
          },
          secondary: {
            main: '#2563EB',
          },
          background: {
            default: mode === 'dark' ? '#070c15' : '#f8fafc',
            paper: mode === 'dark' ? '#0f1623' : '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Inter", "Poppins", sans-serif',
          fontSize: 15,
          h4: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
          body1: { fontSize: '1rem' },
          body2: { fontSize: '0.95rem' },
        },
        shape: {
          borderRadius: 16,
        },
      }),
    [mode]
  );

  const isAuthPage = ['/login', '/register', '/verify-otp', '/forgot-password'].includes(location.pathname);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {showLoader && <LoadingScreen onDone={handleLoaderDone} />}
      {!isAuthPage && (
        <header className="app-header">
          <Navbar mode={mode} setMode={setMode} />
        </header>
      )}
      <ToastContainer />

      <main className={`app-content ${isAuthPage ? 'app-content--auth' : ''}`}>
        <Routes>
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/login" element={<PublicRoute><Login mode={mode} setMode={setMode} /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register mode={mode} setMode={setMode} /></PublicRoute>} />
          <Route path="/verify-otp" element={<PublicRoute><VerifyOtpPage mode={mode} setMode={setMode} /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage mode={mode} setMode={setMode} /></PublicRoute>} />
          <Route path="/bidding" element={<PrivateRoute><BiddingPage /></PrivateRoute>} />
          <Route path="/equipment" element={<PrivateRoute><EquipmentPage /></PrivateRoute>} />
          <Route path="/guidance" element={<PrivateRoute><GuidancePage /></PrivateRoute>} />
          <Route path="/about" element={<PrivateRoute><About /></PrivateRoute>} />
          <Route path="/chat" element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } />

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
      </main>
    </ThemeProvider>
  );
}

export default App;
