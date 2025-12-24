import React from 'react';
import { Container, Typography, Grid, Card, Button, Box, Avatar, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BuildIcon from '@mui/icons-material/Build';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const Home = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              mx: 'auto',
              mb: 3,
            }}
          >
            <AgricultureIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Welcome to AggroConnect
          </Typography>
          <Typography variant="h5" paragraph sx={{ opacity: 0.9 }}>
            Connecting Farmers and Buyers for Better Agriculture
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/register"
              sx={{
                mr: 2,
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/bidding"
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              Explore Market
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" textAlign="center" gutterBottom color="primary" fontWeight="bold">
          Choose Your Role
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" mb={6}>
          Join our agricultural community and start trading today
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                <AgricultureIcon />
              </Avatar>
              <Typography variant="h5" component="h2" gutterBottom color="primary">
                For Farmers
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                List your products for bidding, manage your farm equipment, and access expert farming guidance.
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip label="Product Listing" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Equipment Management" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Expert Guidance" size="small" sx={{ mb: 1 }} />
              </Box>
              <Button variant="contained" component={Link} to="/register" fullWidth size="large">
                Join as Farmer
              </Button>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'secondary.main', mx: 'auto', mb: 2 }}>
                <ShoppingCartIcon />
              </Avatar>
              <Typography variant="h5" component="h2" gutterBottom color="secondary.main">
                For Buyers
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Browse fresh products, participate in competitive bidding, and rent farming equipment.
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip label="Product Bidding" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Equipment Rental" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Quality Assurance" size="small" sx={{ mb: 1 }} />
              </Box>
              <Button variant="contained" component={Link} to="/register" fullWidth size="large" color="secondary">
                Join as Buyer
              </Button>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
                <BuildIcon />
              </Avatar>
              <Typography variant="h5" component="h2" gutterBottom color="info.main">
                Platform Features
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Advanced bidding system, equipment rental marketplace, and comprehensive farming guidance.
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip label="Real-time Bidding" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Equipment Rental" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Farming Guidance" size="small" sx={{ mb: 1 }} />
              </Box>
              <Button variant="outlined" component={Link} to="/bidding" fullWidth size="large">
                Explore Features
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" gutterBottom color="primary" fontWeight="bold">
            Why Choose AggroConnect?
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" mb={6}>
            Experience the future of agricultural trading
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom color="success.main">
                  Fair Pricing
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Competitive bidding ensures fair prices for both farmers and buyers through transparent marketplace dynamics.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
                  <BuildIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom color="warning.main">
                  Equipment Access
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rent farming equipment easily when you need it, reducing costs and increasing productivity.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
                  <SchoolIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom color="info.main">
                  Expert Guidance
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access comprehensive farming guidance for better crop management and sustainable practices.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: 'secondary.main', mx: 'auto', mb: 2 }}>
                  <GroupIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom color="secondary.main">
                  Community
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Join a thriving community of farmers and agricultural professionals sharing knowledge and opportunities.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Ready to Transform Your Agricultural Business?
          </Typography>
          <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
            Join thousands of farmers and buyers already using AggroConnect
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/register"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            Start Your Journey Today
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4, textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © 2025 AggroConnect. All rights reserved. Developed by Manish.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
