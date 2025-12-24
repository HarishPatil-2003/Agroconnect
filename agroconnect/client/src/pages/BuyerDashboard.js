import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import api from '../utils/auth';

const BuyerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    myBids: [],
    activeProducts: []
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [openBidDialog, setOpenBidDialog] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/buyers/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleOpenBidDialog = (product) => {
    setSelectedProduct(product);
    setBidAmount((product.currentBid + 1).toString());
    setOpenBidDialog(true);
  };

  const handleCloseBidDialog = () => {
    setOpenBidDialog(false);
    setSelectedProduct(null);
    setBidAmount('');
  };

  const handlePlaceBid = async () => {
    try {
      await api.post(`/bidding/products/${selectedProduct._id}/bid`, {
        amount: parseFloat(bidAmount)
      });
      handleCloseBidDialog();
      fetchDashboardData();
    } catch (error) {
      console.error('Error placing bid:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Buyer Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">My Active Bids</Typography>
              <Typography variant="h4" color="primary">
                {dashboardData.myBids.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Available Products</Typography>
              <Typography variant="h4" color="secondary">
                {dashboardData.activeProducts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* My Bids Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Bids
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>My Bid</TableCell>
                      <TableCell>Current Highest</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>End Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.myBids.map((bid) => (
                      <TableRow key={bid._id}>
                        <TableCell>{bid.product?.name}</TableCell>
                        <TableCell>${bid.amount}</TableCell>
                        <TableCell>${bid.product?.currentBid}</TableCell>
                        <TableCell>
                          <Chip
                            label={bid.status || 'active'}
                            color={
                              bid.status === 'won'
                                ? 'success'
                                : bid.status === 'lost'
                                ? 'error'
                                : 'warning'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(bid.product?.biddingEndTime).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Available Products */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Products for Bidding
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Farmer</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Base Price</TableCell>
                      <TableCell>Current Bid</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.activeProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>{product.name}</TableCell>

                        {/* ✅ FIXED FARMER NAME */}
                        <TableCell>
                          {product.farmer?.name || 'N/A'}
                        </TableCell>

                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          {product.quantity} {product.unit}
                        </TableCell>
                        <TableCell>${product.basePrice}</TableCell>
                        <TableCell>
                          ${product.currentBid ?? 'No bids'}
                        </TableCell>
                        <TableCell>
                          {new Date(product.biddingEndTime).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleOpenBidDialog(product)}
                          >
                            Place Bid
                          </Button>
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

      {/* Bid Dialog */}
      <Dialog open={openBidDialog} onClose={handleCloseBidDialog}>
        <DialogTitle>Place Bid</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <>
              <Typography variant="h6">{selectedProduct.name}</Typography>
              <Typography>
                Current Highest Bid: ${selectedProduct.currentBid ?? 'No bids'}
              </Typography>
              <Typography>
                Base Price: ${selectedProduct.basePrice}
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Your Bid Amount ($)"
                type="number"
                fullWidth
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBidDialog}>Cancel</Button>
          <Button onClick={handlePlaceBid} variant="contained">
            Place Bid
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BuyerDashboard;
