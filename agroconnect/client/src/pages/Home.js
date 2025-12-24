import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom color="primary">
          Welcome to AggroConnect
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Connecting Farmers and Buyers for Better Agriculture
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                For Farmers
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                List your products for bidding, manage your farm equipment, and access farming guidance.
              </Typography>
              <Button variant="contained" component={Link} to="/register" fullWidth>
                Join as Farmer
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                For Buyers
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Browse products, participate in bidding, and rent farming equipment.
              </Typography>
              <Button variant="contained" component={Link} to="/register" fullWidth>
                Join as Buyer
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Features
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Bidding system, equipment rental, farming guidance, and more.
              </Typography>
              <Button variant="outlined" component={Link} to="/bidding" fullWidth>
                Explore Features
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={6} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Why Choose AggroConnect?
        </Typography>
        <Grid container spacing={3} mt={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Fair Pricing</Typography>
            <Typography variant="body2" color="text.secondary">
              Competitive bidding ensures fair prices for both farmers and buyers.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Equipment Access</Typography>
            <Typography variant="body2" color="text.secondary">
              Rent farming equipment easily when you need it.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Expert Guidance</Typography>
            <Typography variant="body2" color="text.secondary">
              Access farming guidance for better crop management.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Community</Typography>
            <Typography variant="body2" color="text.secondary">
              Join a community of farmers and agricultural professionals.
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
