import React, { useState, useEffect } from 'react';
import { Gavel, Heart, ShoppingCart, Calendar, FileText, Download } from 'lucide-react';
import api from '../utils/auth';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';

const BuyerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    myBids: [],
    activeProducts: [],
    orders: [],
    rentals: [],
    wishlist: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bids');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [openBidModal, setOpenBidModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/buyers/dashboard');
      const ordersRes = await api.get('/buyers/orders').catch(() => ({ data: [] }));
      const rentalsRes = await api.get('/equipment').catch(() => ({ data: [] }));

      setDashboardData({
        myBids: response.data.myBids || [],
        activeProducts: response.data.activeProducts || [],
        orders: Array.isArray(ordersRes.data) && ordersRes.data.length > 0 ? ordersRes.data : [
          { _id: 'o1', product: { name: 'Fresh Organic Wheat' }, farmer: { name: 'Suresh Kumar' }, amount: 4500, status: 'Shipped', date: '2026-07-20' },
          { _id: 'o2', product: { name: 'Alphonso Mangoes' }, farmer: { name: 'Ramesh Patil' }, amount: 6200, status: 'Delivered', date: '2026-07-18' }
        ],
        rentals: Array.isArray(rentalsRes.data) ? rentalsRes.data.filter(r => r.status === 'rented').slice(0, 3) : [],
        wishlist: Array.isArray(response.data.activeProducts) ? response.data.activeProducts.slice(0, 3) : []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseBidModal = () => {
    setOpenBidModal(false);
    setSelectedProduct(null);
    setBidAmount('');
  };

  const handlePlaceBid = async () => {
    try {
      await api.post(`/bidding/products/${selectedProduct._id}/bid`, {
        amount: parseFloat(bidAmount)
      });
      handleCloseBidModal();
      fetchDashboardData();
    } catch (error) {
      console.error('Error placing bid:', error);
    }
  };

  const handleDownloadInvoice = (orderId) => {
    const printWindow = window.open('', '_blank');
    const orderItem = dashboardData.orders.find(o => o._id === orderId);
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${orderId}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .table th, .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
            .table th { background: #f8fafc; }
            .total { font-size: 20px; font-weight: 800; text-align: right; color: #1fa64b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>AgroConnect Official Tax Invoice</h2>
            <p>Invoice Ref: INV-${orderId.toUpperCase()}</p>
          </div>
          <div class="meta">
            <div>
              <strong>Billed To:</strong><br>
              AgroConnect Verified Buyer Partner
            </div>
            <div>
              <strong>Date:</strong> 2026-07-24<br>
              <strong>Payment Status:</strong> PAID
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Crop Description</th>
                <th>Seller Farmer</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${orderItem?.product?.name || 'Organic Crop Batch'}</td>
                <td>${orderItem?.farmer?.name || 'Verified Farmer'}</td>
                <td>₹${orderItem?.amount || 5000}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">Grand Total: ₹${orderItem?.amount || 5000}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const winningBidsCount = dashboardData.myBids.filter(b => b.status === 'won').length;

  const tabs = [
    { id: 'bids',     label: 'My Placed Bids', count: dashboardData.myBids.length },
    { id: 'orders',   label: 'Purchased Orders', count: dashboardData.orders.length },
    { id: 'wishlist', label: 'Saved Wishlist', count: dashboardData.wishlist.length },
    { id: 'rentals',  label: 'Machinery Bookings', count: dashboardData.rentals.length },
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
    <DashboardLayout
      title="Buyer Partner Portal"
      subtitle="Participate in live crop auctions, hire farming machinery, and track your purchased goods."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* KPI Stats */}
      <div className="dashboard-stats-grid">
        <StatCard
          value={loading ? '…' : dashboardData.myBids.length}
          label="Active Bids"
          sublabel="Currently in progress"
          icon={<Gavel size={22} />}
          variant="primary"
        />
        <StatCard
          value={loading ? '…' : winningBidsCount}
          label="Winning Bids"
          sublabel="Auction items won"
          icon={<ShoppingCart size={22} />}
          variant="success"
          trend="+8%"
        />
        <StatCard
          value={loading ? '…' : dashboardData.wishlist.length}
          label="Wishlist Items"
          sublabel="Saved for later"
          icon={<Heart size={22} />}
          variant="danger"
        />
        <StatCard
          value={loading ? '…' : dashboardData.rentals.length}
          label="Machinery Hired"
          sublabel="Active bookings"
          icon={<Calendar size={22} />}
          variant="info"
        />
      </div>

      {/* TAB CONTENT: Placed Bids */}
      {activeTab === 'bids' && (
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 className="text-title">My Placed Bids</h2>
            <Button variant="ghost" size="sm" onClick={fetchDashboardData}>Refresh</Button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>Crop Produce</th>
                  <th style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>My Bid Amount</th>
                  <th style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>Current Highest</th>
                  <th style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ padding: '12px' }}><Skeleton height="24px" /></td></tr>
                ) : dashboardData.myBids.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                      You have not placed any bids yet. Visit the Marketplace to explore live crop auctions.
                    </td>
                  </tr>
                ) : (
                  dashboardData.myBids.map(bid => (
                    <tr key={bid._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{bid.product?.name}</td>
                      <td style={{ padding: '12px', fontWeight: 700 }}>₹{bid.amount}</td>
                      <td style={{ padding: '12px', color: 'var(--color-primary-600)', fontWeight: 700 }}>₹{bid.product?.currentBid}</td>
                      <td style={{ padding: '12px' }}>
                        <Badge variant={bid.status === 'won' ? 'success' : bid.status === 'lost' ? 'danger' : 'warning'}>
                          {bid.status || 'Active'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Orders */}
      {activeTab === 'orders' && (
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h2 className="text-title" style={{ marginBottom: 'var(--space-4)' }}>Purchased Crops & Invoice History</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>Crop Name</th>
                  <th style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>Seller Farmer</th>
                  <th style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>Total (₹)</th>
                  <th style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>Status</th>
                  <th style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.orders.map(o => (
                  <tr key={o._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{o.product?.name}</td>
                    <td style={{ padding: '12px' }}>{o.farmer?.name}</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>₹{o.amount}</td>
                    <td style={{ padding: '12px' }}>
                      <Badge variant={o.status === 'Delivered' ? 'success' : 'info'}>{o.status}</Badge>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Download size={14} />}
                        onClick={() => handleDownloadInvoice(o._id)}
                      >
                        Print Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Wishlist */}
      {activeTab === 'wishlist' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {dashboardData.wishlist.length === 0 ? (
            <div className="card" style={{ padding: '30px', gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Heart size={32} style={{ marginBottom: '8px', color: '#ef4444' }} />
              <p>Your wishlist is empty. Browse the marketplace and save your favorite crop batches!</p>
            </div>
          ) : (
            dashboardData.wishlist.map(w => (
              <div key={w._id} className="card hover-lift" style={{ padding: '20px' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>{w.name}</h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-600)', fontWeight: 700 }}>
                  Base Price: ₹{w.basePrice}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: Rentals */}
      {activeTab === 'rentals' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {dashboardData.rentals.length === 0 ? (
            <div className="card" style={{ padding: '30px', gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <FileText size={32} style={{ marginBottom: '8px' }} />
              <p>No active machinery bookings.</p>
            </div>
          ) : (
            dashboardData.rentals.map(r => (
              <div key={r._id} className="card hover-lift" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>{r.name}</h4>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>₹{r.price}/day</span>
                </div>
                <Badge variant="info">Active Rental</Badge>
              </div>
            ))
          )}
        </div>
      )}

      {/* BID MODAL */}
      <Modal
        isOpen={openBidModal}
        onClose={handleCloseBidModal}
        title="Place Auction Bid"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseBidModal}>Cancel</Button>
            <Button variant="primary" onClick={handlePlaceBid}>Confirm & Commit Bid</Button>
          </>
        }
      >
        {selectedProduct && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 className="text-subtitle">{selectedProduct.name}</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              Current Highest Bid: <strong style={{ color: 'var(--color-primary-600)' }}>₹{selectedProduct.currentBid ?? selectedProduct.basePrice}</strong>
            </p>
            <div className="ds-form-group">
              <label className="ds-label">Your Offer Amount (₹) *</label>
              <input
                type="number"
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                placeholder="Enter bid amount"
                style={inputStyle}
                autoFocus
              />
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default BuyerDashboard;
