import React, { useEffect, useState } from 'react';
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
  Box
} from '@mui/material';
import api, { auth } from '../utils/auth';

const BiddingPage = () => {
  const user = auth.getCurrentUser();
  const isFarmer = user?.role === 'farmer';

  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await api.get('/bidding/products');
    setProducts(res.data);
  };

  const openBid = (product) => {
    setSelectedProduct(product);
    setBidAmount(product.highestBid + 1);
    setOpen(true);
  };

  const placeBid = async () => {
    await api.post(`/bidding/products/${selectedProduct._id}/bid`, {
      amount: Number(bidAmount)
    });
    setOpen(false);
    fetchProducts();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        {isFarmer ? 'My Bidding Products' : 'Live Product Bidding'}
      </Typography>

      <Grid container spacing={3}>
        {products.map((p) => (
          <Grid item xs={12} sm={6} md={4} key={p._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{p.name}</Typography>
                <Typography color="text.secondary">{p.description}</Typography>

                <Box mt={1}>
                  <Chip label={p.category} size="small" />
                </Box>

                <Typography mt={1}>
                  <b>Quantity:</b> {p.quantity} {p.unit}
                </Typography>

                <Typography>
                  <b>Base Price:</b> ₹{p.basePrice}
                </Typography>

                <Typography>
                  <b>Highest Bid:</b> ₹{p.highestBid}
                </Typography>

                <Typography>
                  <b>Total Bids:</b> {p.totalBids}
                </Typography>
              </CardContent>

              <CardActions>
                {!isFarmer ? (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => openBid(p)}
                  >
                    Place Bid
                  </Button>
                ) : (
                  <Button fullWidth disabled>
                    Farmer View
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* BID DIALOG (BUYER ONLY) */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Place Bid</DialogTitle>
        <DialogContent>
          <Typography>
            Current Highest: ₹{selectedProduct?.highestBid}
          </Typography>

          <TextField
            fullWidth
            type="number"
            label="Bid Amount"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={placeBid}>
            Submit Bid
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BiddingPage;
