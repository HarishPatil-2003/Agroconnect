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
  const [dashboardData, setDashboardData] = useState({ products: [], activeBids: [] });
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
      const response = await api.get('/farmers/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

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
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Farmer Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Products
              </Typography>
              <Typography variant="h4" color="primary">
                {dashboardData.products.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Bids
              </Typography>
              <Typography variant="h4" color="secondary">
                {dashboardData.activeBids.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  My Products
                </Typography>
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
                      <TableCell>Base Price</TableCell>
                      <TableCell>Current Bid</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>End Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.products.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.quantity} {product.unit}</TableCell>
                        <TableCell>₹{product.basePrice}</TableCell>
                        <TableCell>₹{product.currentBid || 'No bids'}</TableCell>
                        <TableCell>
                          <Chip
                            label={product.status}
                            color={product.status === 'active' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(product.biddingEndTime).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

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
                      <TableCell>Bid Amount</TableCell>
                      <TableCell>Bid Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.activeBids.map((bid) => (
                      <TableRow key={bid._id}>
                        <TableCell>{bid.product.name}</TableCell>
                        <TableCell>{bid.buyer.name}</TableCell>
                        <TableCell>{bid.amount}</TableCell>
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

      {/* Add Product Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Product for Bidding</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={productForm.name}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                name="category"
                value={productForm.category}
                onChange={handleFormChange}
              >
                <MenuItem value="vegetables">Vegetables</MenuItem>
                <MenuItem value="fruits">Fruits</MenuItem>
                <MenuItem value="grains">Grains</MenuItem>
                <MenuItem value="dairy">Dairy</MenuItem>
                <MenuItem value="meat">Meat</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={productForm.description}
                onChange={handleFormChange}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={productForm.quantity}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Unit"
                name="unit"
                value={productForm.unit}
                onChange={handleFormChange}
              >
                <MenuItem value="kg">kg</MenuItem>
                <MenuItem value="tons">tons</MenuItem>
                <MenuItem value="pieces">pieces</MenuItem>
                <MenuItem value="liters">liters</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Base Price (₹)"
                name="basePrice"
                type="number"
                value={productForm.basePrice}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bidding End Time"
                name="biddingEndTime"
                type="datetime-local"
                value={productForm.biddingEndTime}
                onChange={handleFormChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={productForm.location}
                onChange={handleFormChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmitProduct} variant="contained">
            Add Product
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FarmerDashboard;
