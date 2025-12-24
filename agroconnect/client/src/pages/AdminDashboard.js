import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import api from '../utils/auth';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    stats: { totalUsers: 0, totalProducts: 0, totalBids: 0, totalEquipment: 0 },
    recentUsers: [],
    activeProducts: []
  });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching admin dashboard data...');
      const response = await api.get('/admin/dashboard');
      console.log('Dashboard data received:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/admin/equipment');
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1) fetchUsers();
    if (newValue === 2) fetchProducts();
    if (newValue === 3) fetchEquipment();
  };

  const handleOpenRoleDialog = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setOpenRoleDialog(true);
  };

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
    setSelectedUser(null);
    setNewRole('');
  };

  const handleUpdateRole = async () => {
    try {
      await api.put(`/admin/users/${selectedUser._id}/role`, { role: newRole });
      handleCloseRoleDialog();
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/admin/products/${productId}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleDeleteEquipment = async (equipmentId) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await api.delete(`/admin/equipment/${equipmentId}`);
        fetchEquipment();
      } catch (error) {
        console.error('Error deleting equipment:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4" color="primary">
                {dashboardData.stats.totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h4" color="secondary">
                {dashboardData.stats.totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Bids
              </Typography>
              <Typography variant="h4" color="primary">
                {dashboardData.stats.totalBids}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Equipment
              </Typography>
              <Typography variant="h4" color="secondary">
                {dashboardData.stats.totalEquipment}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Users" />
        <Tab label="Products" />
        <Tab label="Equipment" />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Users
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Joined</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.recentUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip label={user.role} size="small" />
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Products
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Farmer</TableCell>
                        <TableCell>Current Bid</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.activeProducts.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.farmer.name}</TableCell>
                          <TableCell>${product.currentBid || 'No bids'}</TableCell>
                          <TableCell>
                            <Chip
                              label={product.status}
                              size="small"
                              color={product.status === 'active' ? 'success' : 'default'}
                            />
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
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              All Users
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={user.role} />
                      </TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => handleOpenRoleDialog(user)}
                        >
                          Change Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              All Products
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Farmer</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Base Price</TableCell>
                    <TableCell>Current Bid</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.farmer.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.basePrice}</TableCell>
                      <TableCell>${product.currentBid || 'No bids'}</TableCell>
                      <TableCell>
                        <Chip
                          label={product.status}
                          color={product.status === 'active' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              All Equipment
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Rental Price</TableCell>
                    <TableCell>Availability</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {equipment.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.owner.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>${item.rentalPrice} {item.priceUnit}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.availability ? 'Available' : 'Rented'}
                          color={item.availability ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteEquipment(item._id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Role Change Dialog */}
      <Dialog open={openRoleDialog} onClose={handleCloseRoleDialog}>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <div>
              <Typography>User: {selectedUser.name} ({selectedUser.email})</Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>New Role</InputLabel>
                <Select
                  value={newRole}
                  label="New Role"
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <MenuItem value="farmer">Farmer</MenuItem>
                  <MenuItem value="buyer">Buyer</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>Cancel</Button>
          <Button onClick={handleUpdateRole} variant="contained">
            Update Role
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
