import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert
} from '@mui/material';
import api from '../utils/auth';

const EquipmentPage = () => {
  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [rentalDays, setRentalDays] = useState(1);
  const [openRentalDialog, setOpenRentalDialog] = useState(false);
  const [rentalMessage, setRentalMessage] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const handleOpenRentalDialog = (item) => {
    setSelectedEquipment(item);
    setRentalDays(1);
    setRentalMessage('');
    setOpenRentalDialog(true);
  };

  const handleCloseRentalDialog = () => {
    setOpenRentalDialog(false);
    setSelectedEquipment(null);
    setRentalDays(1);
    setRentalMessage('');
  };

  const handleRentEquipment = async () => {
    try {
      await api.post(`/equipment/${selectedEquipment._id}/rent`, {
        days: rentalDays
      });
      setRentalMessage('Equipment rented successfully!');
      handleCloseRentalDialog();
      fetchEquipment();
    } catch (error) {
      setRentalMessage(error.response?.data?.message || 'Error renting equipment');
    }
  };

  const calculateTotalCost = () => {
    if (!selectedEquipment) return 0;
    return selectedEquipment.rentalPrice * rentalDays;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Equipment Rental
      </Typography>

      {rentalMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {rentalMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {equipment.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {item.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip label={item.category} size="small" sx={{ mr: 1 }} />
                  <Chip
                    label={item.availability ? 'Available' : 'Rented'}
                    size="small"
                    color={item.availability ? 'success' : 'warning'}
                  />
                </Box>
                <Typography variant="body2">
                  <strong>Owner:</strong> {item.owner?.name || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Rental Price:</strong> ${item.rentalPrice} per {item.priceUnit}
                </Typography>
                <Typography variant="body2">
                  <strong>Location:</strong> {item.location}
                </Typography>
                <Typography variant="body2">
                  <strong>Condition:</strong> {item.condition}
                </Typography>
              </CardContent>
              <CardActions>
                {item.availability ? (
                  <Button
                    size="small"
                    variant="contained"
                    fullWidth
                    onClick={() => handleOpenRentalDialog(item)}
                  >
                    Rent Equipment
                  </Button>
                ) : (
                  <Button size="small" disabled fullWidth>
                    Currently Rented
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Rental Dialog */}
      <Dialog open={openRentalDialog} onClose={handleCloseRentalDialog}>
        <DialogTitle>Rent Equipment</DialogTitle>
        <DialogContent>
          {selectedEquipment && (
            <div>
              <Typography variant="h6">{selectedEquipment.name}</Typography>
              <Typography>Owner: {selectedEquipment.owner?.name || 'N/A'}</Typography>
              <Typography>Price: ${selectedEquipment.rentalPrice} per {selectedEquipment.priceUnit}</Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Number of Days"
                type="number"
                fullWidth
                value={rentalDays}
                onChange={(e) => setRentalDays(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1 }}
                sx={{ mt: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Total Cost:</strong> ${calculateTotalCost()}
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRentalDialog}>Cancel</Button>
          <Button onClick={handleRentEquipment} variant="contained">
            Confirm Rental
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EquipmentPage;
