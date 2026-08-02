import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, DollarSign, HelpCircle, AlertCircle, Package, ShoppingBag, Leaf, Eye, Gavel, FileText, CheckCircle2 } from 'lucide-react';
import api from '../utils/auth';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import { NotificationService } from '../services/NotificationService';

import './FarmerDashboard.css';

const FarmerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    products: [],
    activeBids: [],
    rentals: [],
    guidance: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');
  const [openModal, setOpenModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'vegetables',
    quantity: '',
    unit: 'kg',
    basePrice: '',
    biddingEndTime: '',
    image: '',
    location: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/farmers/dashboard');
      const rentalsRes = await api.get('/equipment').catch(() => ({ data: [] }));
      const guidanceRes = await api.get('/guidance').catch(() => ({ data: [] }));

      setDashboardData({
        products: res.data.products || [],
        activeBids: res.data.activeBids || [],
        rentals: Array.isArray(rentalsRes.data) ? rentalsRes.data.slice(0, 4) : [],
        guidance: Array.isArray(guidanceRes.data) ? guidanceRes.data.slice(0, 4) : []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog  = () => setOpenModal(true);
  const handleCloseDialog = () => {
    setOpenModal(false);
    setProductForm({
      name: '', description: '', category: 'vegetables',
      quantity: '', unit: 'kg', basePrice: '',
      biddingEndTime: '', image: '', location: ''
    });
  };

  const handleFormChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleSubmitProduct = async () => {
    try {
      await api.post('/farmers/products', productForm);
      NotificationService.addNotification({
        title: 'Product Listed',
        message: `Your product "${productForm.name}" has been listed successfully on the marketplace.`,
        type: 'success'
      });
      handleCloseDialog();
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const totalListings = dashboardData.products.length;
  const activeAuctions = dashboardData.products.filter(p => p.status === 'active').length;
  const totalRevenue = dashboardData.products
    .filter(p => p.status === 'sold')
    .reduce((acc, curr) => acc + (curr.currentBid || curr.basePrice), 0);

  const tabs = [
    { id: 'listings', label: 'My Listings' },
    { id: 'bids',     label: 'Live Bid Logs' },
    { id: 'guidance', label: 'Agronomy Reports' },
    { id: 'equipment', label: 'Rentals & Implements' },
  ];

  const inputStyle = {
    width: '100%',
    height: '44px',
    padding: '0 14px',
    background: 'var(--color-surface)',
    border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-base)',
    outline: 'none',
  };

  return (
    <>


      {/* Background Mesh */}
      <div className="farmer-dashboard-bg">
        <div className="fd-mesh" />
        <div className="fd-orb fd-orb-1" />
        <div className="fd-orb fd-orb-2" />
      </div>

      <main className="fd-container">
        
        {/* Cinematic Hero */}
        <div className="fd-header">
          <div className="fd-title-wrapper">
            <span className="fd-word">Farmer</span>
            <span className="fd-word">Portal</span>
            <span className="fd-word">Dashboard</span>
          </div>
          <p className="fd-subtitle">Manage your agricultural listings, equipment hires, and marketplace auctions.</p>
        </div>

        {/* Floating Tabs */}
        <div className="fd-tabs-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`fd-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Statistics Grid */}
        <div className="fd-stats-grid">
          <div className="fd-stat-card">
            <div className="fd-stat-icon primary"><Package size={24} /></div>
            <div className="fd-stat-value">{loading ? '…' : totalListings}</div>
            <div className="fd-stat-label">Crop Listings</div>
          </div>
          <div className="fd-stat-card">
            <div className="fd-stat-icon info"><TrendingUp size={24} /></div>
            <div className="fd-stat-value">{loading ? '…' : activeAuctions}</div>
            <div className="fd-stat-label">Active Auctions</div>
          </div>
          <div className="fd-stat-card">
            <div className="fd-stat-icon success"><DollarSign size={24} /></div>
            <div className="fd-stat-value">{loading ? '…' : `₹${totalRevenue}`}</div>
            <div className="fd-stat-label">Total Revenue</div>
          </div>
          <div className="fd-stat-card">
            <div className="fd-stat-icon warning"><ShoppingBag size={24} /></div>
            <div className="fd-stat-value">{loading ? '…' : dashboardData.rentals.length}</div>
            <div className="fd-stat-label">Equipment Hires</div>
          </div>
        </div>

        {/* Tab Content Areas */}
        <div className="fd-content-area">
          {activeTab === 'listings' && (
            <div>
              <div className="fd-action-bar">
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>My Crop Listings</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="fd-add-btn" onClick={handleOpenDialog}>
                    <Plus size={18} />
                    <span>Add Product Listing</span>
                  </button>
                </div>
              </div>
              <div className="fd-table-container">
                <table className="fd-table">
                  <thead>
                    <tr>
                      <th>Crop Name</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Base Price</th>
                      <th>Highest Bid</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [1, 2, 3].map(n => (
                        <tr key={n}>
                          <td colSpan={6}><Skeleton height="24px" /></td>
                        </tr>
                      ))
                    ) : dashboardData.products.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ background: 'transparent' }}>
                          <div className="fd-empty-state">
                            <div className="fd-empty-icon"><Leaf size={40} /></div>
                            <h3 className="fd-empty-title">No listings posted yet</h3>
                            <p className="fd-empty-desc">Click "Add Product Listing" above to begin selling your crops on the marketplace.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      dashboardData.products.map(p => (
                        <tr key={p._id}>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                          <td>{p.quantity} {p.unit}</td>
                          <td>₹{p.basePrice}</td>
                          <td style={{ color: 'var(--color-primary-600)', fontWeight: 700 }}>
                            {p.currentBid ? `₹${p.currentBid}` : 'No bids'}
                          </td>
                          <td>
                            <span className={`fd-badge ${p.status === 'active' ? 'active' : p.status === 'sold' ? 'sold' : 'default'}`}>
                              {p.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bids' && (
            <div>
              <div className="fd-action-bar">
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Live Auction Bid Logs</h2>
              </div>
              <div className="fd-table-container">
                <table className="fd-table">
                  <thead>
                    <tr>
                      <th>Crop Product</th>
                      <th>Buyer Partner</th>
                      <th>Proposed Bid</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4}><Skeleton height="24px" /></td></tr>
                    ) : dashboardData.activeBids.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ background: 'transparent' }}>
                          <div className="fd-empty-state">
                            <div className="fd-empty-icon"><Gavel size={40} /></div>
                            <h3 className="fd-empty-title">No bids placed yet</h3>
                            <p className="fd-empty-desc">When buyers bid on your crops, they will appear here.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      dashboardData.activeBids.map(bid => (
                        <tr key={bid._id}>
                          <td style={{ fontWeight: 600 }}>{bid.product?.name}</td>
                          <td>{bid.buyer?.name}</td>
                          <td style={{ fontWeight: 700, color: 'var(--color-primary-600)' }}>₹{bid.amount}</td>
                          <td style={{ color: 'var(--color-text-muted)' }}>{new Date(bid.bidTime).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'guidance' && (
            <div>
              <div className="fd-action-bar">
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Agronomy Reports</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {dashboardData.guidance.length === 0 ? (
                  <div className="fd-stat-card" style={{ gridColumn: '1/-1', textAlign: 'center' }}>
                    <div className="fd-empty-icon" style={{ margin: '0 auto 16px' }}><FileText size={32} /></div>
                    <p style={{ color: 'var(--color-text-muted)' }}>No agronomy reports available. Check back soon!</p>
                  </div>
                ) : (
                  dashboardData.guidance.map(g => (
                    <div key={g._id} className="fd-stat-card hover-lift">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-primary-600)', fontWeight: 700 }}>
                        <HelpCircle size={18} />
                        <span>{g.title || 'Organic Protocol'}</span>
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                        {g.description || 'Comprehensive soil health and micro-irrigation practices.'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div>
              <div className="fd-action-bar">
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Rentals & Implements</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {dashboardData.rentals.length === 0 ? (
                  <div className="fd-stat-card" style={{ gridColumn: '1/-1', textAlign: 'center' }}>
                    <div className="fd-empty-icon" style={{ margin: '0 auto 16px' }}><AlertCircle size={32} /></div>
                    <p style={{ color: 'var(--color-text-muted)' }}>No active rental equipment items found.</p>
                  </div>
                ) : (
                  dashboardData.rentals.map(r => (
                    <div key={r._id} className="fd-stat-card hover-lift" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
                      <div>
                        <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>{r.name}</h4>
                        <span style={{ fontSize: '14px', color: 'var(--color-primary-600)', fontWeight: 700 }}>₹{r.price}/day</span>
                      </div>
                      <span className="fd-badge active">{r.status || 'Available'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ADD PRODUCT MODAL (keeping original style for now to not break anything inside modal) */}
      <Modal
        isOpen={openModal}
        onClose={handleCloseDialog}
        title="Add New Crop Product Listing"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseDialog}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitProduct}>Publish Listing</Button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="ds-form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="ds-label">Product Name *</label>
            <input name="name" value={productForm.name} onChange={handleFormChange} placeholder="e.g. Organic Alphonso Mangoes" style={inputStyle} />
          </div>

          <div className="ds-form-group">
            <label className="ds-label">Category</label>
            <select name="category" value={productForm.category} onChange={handleFormChange} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
              <option value="dairy">Dairy</option>
              <option value="meat">Meat</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="ds-form-group">
            <label className="ds-label">Unit</label>
            <select name="unit" value={productForm.unit} onChange={handleFormChange} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="kg">kg</option>
              <option value="tons">tons</option>
              <option value="pieces">pieces</option>
              <option value="liters">liters</option>
            </select>
          </div>

          <div className="ds-form-group">
            <label className="ds-label">Quantity *</label>
            <input type="number" name="quantity" value={productForm.quantity} onChange={handleFormChange} placeholder="500" style={inputStyle} />
          </div>

          <div className="ds-form-group">
            <label className="ds-label">Base Price (₹) *</label>
            <input type="number" name="basePrice" value={productForm.basePrice} onChange={handleFormChange} placeholder="120" style={inputStyle} />
          </div>

          <div className="ds-form-group">
            <label className="ds-label">Bidding End Time</label>
            <input type="datetime-local" name="biddingEndTime" value={productForm.biddingEndTime} onChange={handleFormChange} style={inputStyle} />
          </div>

          <div className="ds-form-group">
            <label className="ds-label">Location</label>
            <input name="location" value={productForm.location} onChange={handleFormChange} placeholder="Nagpur, Maharashtra" style={inputStyle} />
          </div>

          <div className="ds-form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="ds-label">Description</label>
            <textarea name="description" rows={3} value={productForm.description} onChange={handleFormChange} placeholder="Product harvest details, grade, certification..." style={{ ...inputStyle, height: 'auto', paddingTop: '10px', resize: 'vertical' }} />
          </div>

          <div className="ds-form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="ds-label">Image URL</label>
            <input name="image" value={productForm.image} onChange={handleFormChange} placeholder="https://images.unsplash.com/photo-..." style={inputStyle} />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FarmerDashboard;
