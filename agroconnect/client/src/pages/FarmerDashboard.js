import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api from '../utils/auth';

const FarmerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    products: [],
    activeBids: []
  });

  const [open, setOpen] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'vegetables',
    quantity: '',
    unit: 'kg',
    basePrice: '',
    biddingEndTime: '',
    location: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/farmers/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDialog = () => setOpen(true);

  const handleCloseDialog = () => {
    setOpen(false);
    setProductForm({
      name: '',
      description: '',
      category: 'vegetables',
      quantity: '',
      unit: 'kg',
      basePrice: '',
      biddingEndTime: '',
      location: ''
    });
  };

  const handleFormChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitProduct = async () => {
    try {
      await api.post('/farmers/products', productForm);
      handleCloseDialog();
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Farmer Dashboard
      </Typography>

      {/* SUMMARY CARDS */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">My Products</Typography>
              <Typography variant="h4" color="primary">
                {dashboardData.products.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Active Bids</Typography>
              <Typography variant="h4" color="secondary">
                {dashboardData.activeBids.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* PRODUCTS TABLE */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h6">My Products</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialog}
                >
                  Add Product
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Base Price (₹)</TableCell>
                      <TableCell>Highest Bid (₹)</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>End Time</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {dashboardData.products.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{p.category}</TableCell>
                        <TableCell>{p.quantity} {p.unit}</TableCell>
                        <TableCell>₹{p.basePrice}</TableCell>
                        <TableCell>
                          {p.currentBid ? `₹${p.currentBid}` : 'No bids'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={p.status}
                            color={p.status === 'active' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(p.biddingEndTime).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* ACTIVE BIDS */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Bids on My Products
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Buyer</TableCell>
                      <TableCell>Bid Amount (₹)</TableCell>
                      <TableCell>Bid Time</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {dashboardData.activeBids.map((bid) => (
                      <TableRow key={bid._id}>
                        <TableCell>{bid.product.name}</TableCell>
                        <TableCell>{bid.buyer.name}</TableCell>
                        <TableCell>₹{bid.amount}</TableCell>
                        <TableCell>
                          {new Date(bid.bidTime).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ADD PRODUCT DIALOG */}
      <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>Add New Product for Bidding</DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Product Name" name="name" value={productForm.name} onChange={handleFormChange} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Category" name="category" value={productForm.category} onChange={handleFormChange}>
                <MenuItem value="vegetables">Vegetables</MenuItem>
                <MenuItem value="fruits">Fruits</MenuItem>
                <MenuItem value="grains">Grains</MenuItem>
                <MenuItem value="dairy">Dairy</MenuItem>
                <MenuItem value="meat">Meat</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Description" name="description" value={productForm.description} onChange={handleFormChange} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField fullWidth type="number" label="Quantity" name="quantity" value={productForm.quantity} onChange={handleFormChange} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField select fullWidth label="Unit" name="unit" value={productForm.unit} onChange={handleFormChange}>
                <MenuItem value="kg">kg</MenuItem>
                <MenuItem value="tons">tons</MenuItem>
                <MenuItem value="pieces">pieces</MenuItem>
                <MenuItem value="liters">liters</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Base Price (₹)"
                name="basePrice"
                value={productForm.basePrice}
                onChange={handleFormChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Bidding End Time"
                name="biddingEndTime"
                InputLabelProps={{ shrink: true }}
                value={productForm.biddingEndTime}
                onChange={handleFormChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Location" name="location" value={productForm.location} onChange={handleFormChange} />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitProduct}>
            Add Product
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FarmerDashboard;
