import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid
} from '@mui/material';
import api, { auth } from '../utils/auth';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false); // ✅ toggle view/edit
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔹 Load user from backend (not only localStorage)
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      setFormData({
        name: res.data.name || '',
        phone: res.data.phone || '',
        address: res.data.address || ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.put('/auth/profile', formData);

      // ✅ Update UI + localStorage
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setMessage('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          My Profile
        </Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!editMode ? (
          <>
            {/* 🔹 VIEW MODE */}
            <Typography><strong>Name:</strong> {user.name}</Typography>
            <Typography><strong>Email:</strong> {user.email}</Typography>
            <Typography><strong>Phone:</strong> {user.phone || 'N/A'}</Typography>
            <Typography><strong>Address:</strong> {user.address || 'N/A'}</Typography>
            <Typography><strong>Role:</strong> {user.role}</Typography>

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
          </>
        ) : (
          <>
            {/* 🔹 EDIT MODE */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Save'}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;
