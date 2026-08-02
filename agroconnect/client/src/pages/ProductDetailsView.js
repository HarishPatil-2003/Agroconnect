import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, 
  MapPin, 
  Scale, 
  Star, 
  ArrowRight, 
  User, 
  Clock, 
  Shield, 
  X, 
  Send, 
  MessageCircle, 
  ThumbsUp, 
  Flag, 
  ShoppingBag, 
  Share2, 
  CheckCircle2, 
  Truck, 
  FileText, 
  ChevronRight, 
  Award,
  AlertCircle,
  Eye
} from 'lucide-react';
import './ProductDetailsView.css';

const ProductDetailsView = ({
  product,
  onClose,
  user,
  token,
  onPlaceBid,
  bidsLog,
  comments,
  onPostComment,
  onPostReply,
  onLikeComment,
  wishlist,
  onWishlistToggle,
  onShare,
  onBuyNow,
  allProducts,
  onOpenProduct
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeThumbnailIdx, setActiveThumbnailIdx] = useState(0);
  const [bidAmount, setBidAmount] = useState((product.highestBid + 100).toString());
  const [showConfirmBid, setShowConfirmBid] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [commentSort, setCommentSort] = useState('newest');
  const [currentTime, setCurrentTime] = useState(new Date());

  if (!product || !product._id) {
    return (
      <div className="product-details-page" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The requested product listing could not be found or has been deleted from the database.
        </p>
        <button onClick={onClose} className="btn btn-primary">
          Return to Marketplace
        </button>
      </div>
    );
  }

  // Track page view and save to recently viewed
  useEffect(() => {
    if (product?._id) {
      const stored = localStorage.getItem('recentlyViewed');
      let list = [];
      try {
        list = stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.warn('Failed to parse recentlyViewed from storage:', e);
      }
      list = list.filter(id => id !== product._id);
      list.unshift(product._id);
      list = list.slice(0, 8); // Keep last 8 viewed
      localStorage.setItem('recentlyViewed', JSON.stringify(list));
      setActiveThumbnailIdx(0);
      setBidAmount((product.highestBid + 100).toString());
    }
  }, [product]);

  // Live timer interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRemainingTimeLive = (endTime) => {
    if (!endTime) return 'Expired';
    const difference = +new Date(endTime) - +currentTime;
    if (difference <= 0) return 'Auction Closed';
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
    return `${hours}h ${minutes}m ${seconds}s left`;
  };

  const isAuction = product.biddingEndTime && new Date(product.biddingEndTime) > new Date();
  const priceDisplay = product.highestBid || product.basePrice;
  const unitLabel = product.unit ? `/${product.unit}` : '';

  // Get crop-specific mockup technical specifications
  const getCropSpecs = (p) => {
    const name = (p.name || '').toLowerCase();
    const specs = {
      variety: 'Hybrid Variety',
      harvestDate: 'Current Season',
      shelfLife: '30 Days',
      moisture: '14%',
      packaging: 'Standard Bags (50kg)',
      storage: 'Cool dry warehouse',
      temp: '15-20 °C',
      color: 'Natural',
      origin: p.location || 'Punjab, India',
      cultivation: p.description?.toLowerCase().includes('organic') ? '100% Organic' : 'Conventional Safe',
      delivery: '3-5 Working Days',
      minOrder: '500 kg'
    };

    if (name.includes('onion')) {
      specs.variety = 'Nasik Red (N-2-4-1)';
      specs.harvestDate = '12 May 2026';
      specs.shelfLife = '90 Days';
      specs.moisture = '12%';
      specs.packaging = 'Mesh Gunny Bags (40kg)';
      specs.storage = 'Well-ventilated dry racks';
      specs.temp = 'Dry ambient';
      specs.color = 'Deep Purple Red';
      specs.minOrder = '1,000 kg';
    } else if (name.includes('potato')) {
      specs.variety = 'Kufri Jyoti';
      specs.harvestDate = '20 May 2026';
      specs.shelfLife = '60 Days';
      specs.moisture = '15%';
      specs.packaging = 'Jute Sacks (50kg)';
      specs.storage = 'Cold Storage, dark ventilated';
      specs.temp = '4-7 °C';
      specs.color = 'Golden Brown';
    } else if (name.includes('tomato')) {
      specs.variety = 'Abhinav Hybrid';
      specs.harvestDate = '23 July 2026';
      specs.shelfLife = '14 Days';
      specs.moisture = '85% water content';
      specs.packaging = 'Crates (25kg)';
      specs.storage = 'Ambient aerated room';
      specs.temp = '13-15 °C';
      specs.color = 'Bright Scarlet Red';
    } else if (name.includes('rice')) {
      specs.variety = 'Pusa Basmati 1121';
      specs.harvestDate = 'December 2025 (Aged)';
      specs.shelfLife = '730 Days';
      specs.moisture = '11%';
      specs.packaging = 'PP Bags (25kg)';
      specs.storage = 'Grain warehouse, pest-controlled';
      specs.temp = 'Dry ambient';
      specs.color = 'Creamy White';
    }

    return specs;
  };

  const getSellerProfile = (p) => {
    return {
      name: p.farmer?.name || 'Verified Farmer',
      rating: p.rating || 4.7,
      experience: '8 Years',
      location: p.location || 'Punjab, India',
      farmSize: '15 Acres',
      primaryCrops: p.category || 'Vegetables',
      totalSales: '₹12.5 Lakhs',
      completedAuctions: 48,
      responseTime: '< 2 Hours',
      successRate: '98.5%'
    };
  };

  const specs = useMemo(() => getCropSpecs(product), [product]);
  const seller = useMemo(() => getSellerProfile(product), [product]);

  // Related products logic (same category)
  const relatedProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts
      .filter(p => p.category === product.category && p._id !== product._id)
      .slice(0, 6);
  }, [allProducts, product]);

  // Recently viewed products logic
  const recentlyViewedProducts = useMemo(() => {
    if (!allProducts) return [];
    const stored = localStorage.getItem('recentlyViewed') || '[]';
    let list = [];
    try {
      list = JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse recentlyViewed in useMemo:', e);
    }
    return list
      .map(id => allProducts.find(p => p._id === id))
      .filter(p => p && p._id !== product._id)
      .slice(0, 6);
  }, [allProducts, product]);

  const handlePlaceBidClick = () => {
    if (!token) {
      alert('Please login to place a bid.');
      return;
    }
    if (user?.role !== 'buyer') {
      alert('Only buyers can place bids.');
      return;
    }
    const amount = Number(bidAmount);
    if (amount <= product.highestBid) {
      alert('Bid must be higher than current highest bid.');
      return;
    }
    setShowConfirmBid(true);
  };

  const handleConfirmBid = async () => {
    await onPlaceBid(Number(bidAmount));
    setShowConfirmBid(false);
  };

  const renderBidChart = () => {
    if (!bidsLog || bidsLog.length === 0) return null;
    const prices = bidsLog.map(b => b.amount).reverse();
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const range = maxPrice - minPrice || 1;
    
    const width = 450;
    const height = 130;
    const padding = 15;
    
    const points = prices.map((price, idx) => {
      const x = padding + (idx / (prices.length - 1 || 1)) * (width - 2 * padding);
      const y = height - padding - ((price - minPrice) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div style={{ marginTop: '16px', background: 'var(--bg-body)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '800' }}>Bidding Trend Graph</h5>
        <svg width="100%" height="130" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="var(--green-primary)"
            strokeWidth="3"
            points={points}
          />
          {prices.map((price, idx) => {
            const x = padding + (idx / (prices.length - 1 || 1)) * (width - 2 * padding);
            const y = height - padding - ((price - minPrice) / range) * (height - 2 * padding);
            return (
              <g key={idx}>
                <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="var(--green-primary)" strokeWidth="2" />
                <text x={x} y={y - 8} fontSize="9" textAnchor="middle" fill="var(--text-primary)" fontWeight="bold">
                  ₹{price}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content-panel">
            <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', fontFamily: 'Poppins, sans-serif' }}>Harvest Overview</h4>
            <p style={{ lineHeight: '1.6', fontSize: '14.5px', color: 'var(--text-secondary)' }}>{product.description}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><strong>Quality Grade:</strong> {specs.grade}</div>
                <div><strong>Harvest Date:</strong> {specs.harvestDate}</div>
                <div><strong>Shelf Life:</strong> {specs.shelfLife}</div>
                <div><strong>Moisture Level:</strong> {specs.moisture}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><strong>Packaging:</strong> {specs.packaging}</div>
                <div><strong>Min Order Qty:</strong> {specs.minOrder}</div>
                <div><strong>Organic Certified:</strong> {product.isOrganic ? 'Yes (APEDA Certified)' : 'No'}</div>
                <div><strong>Storage:</strong> {specs.storage}</div>
              </div>
            </div>
          </div>
        );
      case 'specifications':
        return (
          <div className="tab-content-panel">
            <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>Technical Specifications</h4>
            <table className="specs-table">
              <tbody>
                <tr>
                  <td className="spec-name">Crop Variety</td>
                  <td className="spec-value">{specs.variety}</td>
                </tr>
                <tr>
                  <td className="spec-name">Total Weight Available</td>
                  <td className="spec-value">{product.quantity} {product.unit || 'kg'}</td>
                </tr>
                <tr>
                  <td className="spec-name">Quality Grade</td>
                  <td className="spec-value">{specs.grade}</td>
                </tr>
                <tr>
                  <td className="spec-name">Natural Color</td>
                  <td className="spec-value">{specs.color}</td>
                </tr>
                <tr>
                  <td className="spec-name">Origin Location</td>
                  <td className="spec-value">{specs.origin}</td>
                </tr>
                <tr>
                  <td className="spec-name">Cultivation Method</td>
                  <td className="spec-value">{specs.cultivation}</td>
                </tr>
                <tr>
                  <td className="spec-name">Packaging Type</td>
                  <td className="spec-value">{specs.packaging}</td>
                </tr>
                <tr>
                  <td className="spec-name">Storage Temperature</td>
                  <td className="spec-value">{specs.temp}</td>
                </tr>
                <tr>
                  <td className="spec-name">Moisture Level</td>
                  <td className="spec-value">{specs.moisture}</td>
                </tr>
                <tr>
                  <td className="spec-name">Expected Delivery Transit</td>
                  <td className="spec-value">{specs.delivery}</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case 'auction':
        return (
          <div className="tab-content-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '800', margin: 0, fontFamily: 'Poppins, sans-serif' }}>Auction Dashboard</h4>
              <span className={`premium-badge ${isAuction ? 'premium-badge--auction' : 'premium-badge--buynow'}`}>
                {isAuction ? 'Live Auction' : 'Closed'}
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div><strong>Starting Base Price:</strong> ₹{product.basePrice}</div>
                <div><strong>Current Highest Bid:</strong> ₹{product.highestBid}</div>
                <div><strong>Top Bidder:</strong> {bidsLog[0]?.bidder || 'No bids yet'}</div>
                <div><strong>Minimum Increment:</strong> ₹100</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div><strong>Total Bids Logged:</strong> {bidsLog.length}</div>
                <div><strong>Auction Guidelines:</strong> 10% security deposit required. Final winner must coordinate pickup within 48 hours.</div>
              </div>
            </div>

            {renderBidChart()}

            <div style={{ marginTop: '16px' }}>
              <h5 style={{ margin: '0 0 12px 0', fontFamily: 'Poppins, sans-serif' }}>Bidding Timeline</h5>
              <div className="premium-timeline">
                {bidsLog.map((log, idx) => (
                  <div key={idx} className="timeline-step">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <strong>{log.bidder}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                          {new Date(log.time).toLocaleTimeString()}
                        </span>
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--green-primary)' }}>₹{log.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'discussion':
        const sortedComments = [...comments].sort((a, b) => {
          if (commentSort === 'popular') return (b.likes || 0) - (a.likes || 0);
          return new Date(b.date || 0) - new Date(a.date || 0);
        });

        return (
          <div className="tab-content-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '800', margin: 0, fontFamily: 'Poppins, sans-serif' }}>Community Discussion</h4>
              <select 
                value={commentSort} 
                onChange={(e) => setCommentSort(e.target.value)}
                style={{ background: 'var(--bg-body)', color: 'var(--text-dark)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', fontSize: '12.5px' }}
              >
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <input 
                type="text" 
                placeholder="Ask a question about crop variety, shipping, or certification..." 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                className="profile-input"
                style={{ flex: 1, height: '44px' }}
              />
              <button onClick={() => { onPostComment(newComment); setNewComment(''); }} className="liquid-btn liquid-btn-primary" style={{ width: '48px', height: '48px', padding: 0 }}>
                <Send size={16} />
              </button>
            </div>

            <div>
              {sortedComments.map((c) => (
                <div key={c.id} className="discussion-card">
                  <div className="discussion-header">
                    <div className="discussion-avatar">{c.author[0].toUpperCase()}</div>
                    <div>
                      <strong style={{ fontSize: '14px' }}>{c.author}</strong>
                      {c.isVerified && <span style={{ fontSize: '9px', background: 'var(--green-light)', color: 'var(--green-primary)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: 'bold' }}>Verified Buyer</span>}
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{c.date}</div>
                    </div>
                  </div>
                  <p style={{ margin: '4px 0', fontSize: '14px', lineHeight: '1.5' }}>{c.text}</p>
                  
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', marginTop: '6px' }}>
                    <button onClick={() => onLikeComment(c.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ThumbsUp size={12} /> Like ({c.likes || 0})
                    </button>
                    <button onClick={() => setReplyingToId(replyingToId === c.id ? null : c.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageCircle size={12} /> Reply
                    </button>
                  </div>

                  {replyingToId === c.id && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <input 
                        type="text" 
                        placeholder="Write a reply..." 
                        value={replyText} 
                        onChange={(e) => setReplyText(e.target.value)} 
                        className="profile-input"
                        style={{ height: '36px', fontSize: '13px' }}
                      />
                      <button onClick={() => { onPostReply(c.id, replyText); setReplyText(''); setReplyingToId(null); }} className="liquid-btn liquid-btn-primary" style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}>
                        Reply
                      </button>
                    </div>
                  )}

                  {c.replies && c.replies.length > 0 && (
                    <div className="discussion-replies">
                      {c.replies.map((r, rIdx) => (
                        <div key={rIdx}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10B981', color: '#fff', fontSize: '9px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {r.author[0].toUpperCase()}
                            </div>
                            <strong style={{ fontSize: '12.5px' }}>{r.author}</strong>
                            <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>• {r.date}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '13px', paddingLeft: '28px', color: 'var(--text-secondary)' }}>{r.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'seller':
        return (
          <div className="tab-content-panel">
            <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>Farmer Profile</h4>
            <div className="seller-profile-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--green-primary), #047857)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '22px'
                }}>
                  {seller.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{seller.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
                    <Shield size={14} style={{ color: 'var(--green-primary)' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--green-primary)' }}>Verified Farmer Partner</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />{seller.location}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-body)', padding: '12px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Experience</span>
                  <div style={{ fontWeight: '700' }}>{seller.experience}</div>
                </div>
                <div style={{ background: 'var(--bg-body)', padding: '12px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Farm Size</span>
                  <div style={{ fontWeight: '700' }}>{seller.farmSize}</div>
                </div>
                <div style={{ background: 'var(--bg-body)', padding: '12px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Completed Sales</span>
                  <div style={{ fontWeight: '700' }}>{seller.completedAuctions} listings</div>
                </div>
                <div style={{ background: 'var(--bg-body)', padding: '12px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Response Rate</span>
                  <div style={{ fontWeight: '700' }}>{seller.responseTime}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="liquid-btn liquid-btn-primary" style={{ flex: 1, height: '40px' }} onClick={() => alert('Chat interface starting with farmer...')}>
                  Message Farmer
                </button>
                <button className="liquid-btn liquid-btn-secondary" style={{ flex: 1, height: '40px' }} onClick={() => alert('Farmer profile followed!')}>
                  Follow Profile
                </button>
              </div>
            </div>
          </div>
        );
      case 'reviews':
        return (
          <div className="tab-content-panel">
            <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>Customer Feedback</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '30% 70%', gap: '24px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center', background: 'var(--bg-body)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#f59e0b' }}>{seller.rating}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', margin: '6px 0' }}>
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>48 Verified Sales</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', width: '40px' }}>5 Star</span>
                  <div style={{ flex: 1, height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: '85%', height: '100%', background: '#f59e0b' }}></div></div>
                  <span style={{ fontSize: '12px', width: '30px' }}>85%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', width: '40px' }}>4 Star</span>
                  <div style={{ flex: 1, height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: '10%', height: '100%', background: '#f59e0b' }}></div></div>
                  <span style={{ fontSize: '12px', width: '30px' }}>10%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', width: '40px' }}>3 Star</span>
                  <div style={{ flex: 1, height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: '5%', height: '100%', background: '#f59e0b' }}></div></div>
                  <span style={{ fontSize: '12px', width: '30px' }}>5%</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong>Rajesh K.</strong>
                  <span style={{ fontSize: '11px', background: 'var(--green-light)', color: 'var(--green-primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Verified Purchaser</span>
                </div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Outstanding crop quality. Very uniform size, perfectly dry and neatly bagged. Logistics were prompt.</p>
              </div>
            </div>
          </div>
        );
      case 'shipping':
        return (
          <div className="tab-content-panel">
            <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>Shipping & Logistics</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><strong>Logistics Partner:</strong> Direct Ground Freight via verified AgriTruck fleets.</div>
                <div><strong>Available Delivery Regions:</strong> All states in India (Punjab, Haryana, UP, West Bengal, Maharashtra, etc.).</div>
                <div><strong>Pickup Alternative:</strong> Free farm-gate self-pickup is available. Direct coordination upon award.</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><strong>Freight Estimation:</strong> ₹4 - ₹8 per kg depending on physical distance and volume.</div>
                <div><strong>Packaging:</strong> Packaged in laminated 50kg moisture-resistant polypropylene bags.</div>
                <div><strong>Transit Insurance:</strong> Included basic insurance cover for transit spoilage up to 80% valuation.</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="details-page-wrapper">
      
      {/* Sticky Header Nav */}
      <div className="sticky-subnav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'var(--green-primary)', fontWeight: 'bold', gap: '6px' }}>
            <X size={16} /> Back
          </button>
          <div style={{ width: '1px', height: '18px', background: 'var(--border)' }} />
          <h2 className="sticky-subnav__title">{product.name}</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="hide-on-mobile">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{isAuction ? 'Highest Bid' : 'Price'}</span>
            <strong style={{ color: 'var(--green-primary)', fontSize: '16px' }}>₹{priceDisplay}{unitLabel}</strong>
          </div>
          {isAuction ? (
            <button className="liquid-btn liquid-btn-primary" style={{ height: '36px', padding: '0 16px', fontSize: '13px' }} onClick={handlePlaceBidClick}>
              Bid Now
            </button>
          ) : (
            <button className="liquid-btn liquid-btn-primary" style={{ height: '36px', padding: '0 16px', fontSize: '13px' }} onClick={onBuyNow}>
              Buy Now
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="breadcrumb-container">
        <span className="breadcrumb-link" onClick={onClose}>Marketplace</span>
        <span className="breadcrumb-separator"><ChevronRight size={14} /></span>
        <span style={{ textTransform: 'capitalize' }}>{product.category}</span>
        <span className="breadcrumb-separator"><ChevronRight size={14} /></span>
        <span style={{ color: 'var(--green-primary)', fontWeight: '600' }}>{product.name}</span>
      </div>

      {/* Hero section */}
      <div className="hero-grid">
        
        {/* Left Gallery Column */}
        <div className="gallery-wrapper">
          <div 
            className="zoom-image-container"
            onMouseMove={(e) => {
              const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - left) / width) * 100;
              const y = ((e.clientY - top) / height) * 100;
              e.currentTarget.querySelector('img').style.transformOrigin = `${x}% ${y}%`;
              e.currentTarget.querySelector('img').style.transform = 'scale(1.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.querySelector('img').style.transform = 'scale(1)';
            }}
          >
            <img 
              src={
                product.images && product.images.length > 0 
                  ? product.images[activeThumbnailIdx] 
                  : (product.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80')
              } 
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80';
              }}
            />
            
            {/* Overlay Badges */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span className={`premium-badge ${isAuction ? 'premium-badge--auction' : 'premium-badge--buynow'}`}>
                {isAuction ? 'Auction Listing' : 'Buy Now'}
              </span>
              {product.isOrganic && <span className="premium-badge premium-badge--organic">100% Organic</span>}
              {product.isVerified && <span className="premium-badge premium-badge--verified">Verified Partner</span>}
            </div>
          </div>

          {product.images && product.images.length > 1 && (
            <div className="thumbnail-slider">
              {product.images.map((img, idx) => (
                <img 
                  key={idx}
                  src={img} 
                  alt="" 
                  className={`thumbnail-item ${activeThumbnailIdx === idx ? 'thumbnail-item--active' : ''}`}
                  onClick={() => setActiveThumbnailIdx(idx)}
                />
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <button className="liquid-btn liquid-btn-secondary" style={{ flex: 1, height: '44px' }} onClick={() => onWishlistToggle(product._id)}>
              <Heart size={16} fill={wishlist.includes(product._id) ? '#ef4444' : 'none'} color={wishlist.includes(product._id) ? '#ef4444' : 'currentColor'} />
              {wishlist.includes(product._id) ? 'Saved' : 'Wishlist'}
            </button>
            <button className="liquid-btn liquid-btn-secondary" style={{ flex: 1, height: '44px' }} onClick={() => onShare(product)}>
              <Share2 size={16} /> Share Link
            </button>
          </div>
        </div>

        {/* Right Info Column */}
        <div className="product-info-panel">
          <div>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.05em' }}>{product.category}</span>
            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '4px 0 12px 0', fontFamily: 'Poppins, sans-serif', lineHeight: '1.2' }}>{product.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B' }}>
                <Star size={16} fill="#F59E0B" />
                <strong style={{ fontSize: '15px' }}>{product.rating || 4.7}</strong>
              </div>
              <div style={{ width: '1px', height: '14px', background: 'var(--border)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green-primary)', fontWeight: '600' }}>
                <Shield size={16} />
                <span>{seller.name}</span>
              </div>
              <div style={{ width: '1px', height: '14px', background: 'var(--border)' }} />
              <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                <MapPin size={14} />
                <span>{product.location}</span>
              </div>
            </div>
          </div>

          {isAuction && (
            <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={20} style={{ color: '#ef4444' }} />
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Bidding Deadline Closing in:</div>
                <strong style={{ color: '#ef4444', fontSize: '18px', fontFamily: 'Poppins, sans-serif' }}>{getRemainingTimeLive(product.biddingEndTime)}</strong>
              </div>
            </div>
          )}

          <div className="price-box-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Base Starting Price</span>
                <div style={{ fontSize: '20px', fontWeight: '800' }}>₹{product.basePrice}</div>
              </div>
              <div style={{ height: '40px', width: '1px', background: 'var(--border)' }} />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{isAuction ? 'Current Highest Bid' : 'Buy Price'}</span>
                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--green-primary)', fontFamily: 'Poppins, sans-serif' }}>₹{priceDisplay}{unitLabel}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '24px', fontSize: '14.5px' }}>
              <div><strong>Available Stock:</strong> {product.quantity} {product.unit || 'kg'}</div>
              <div><strong>Minimum Order:</strong> {specs.minOrder}</div>
            </div>

            {isAuction ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="profile-label" style={{ fontWeight: '700' }}>Submit Competitive Bid (₹)</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    type="number" 
                    value={bidAmount} 
                    onChange={(e) => setBidAmount(e.target.value)} 
                    className="profile-input" 
                    style={{ flex: 1, height: '48px', fontSize: '16px' }}
                  />
                  <button onClick={handlePlaceBidClick} className="liquid-btn liquid-btn-primary" style={{ height: '48px', padding: '0 28px' }}>
                    Place Bid
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={onBuyNow} className="liquid-btn liquid-btn-primary" style={{ width: '100%', height: '48px', fontSize: '16px' }}>
                <ShoppingBag size={18} /> Buy Now
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Quick Stats Cards */}
      <div className="quick-stats-grid">
        <div className="glass-stat-card">
          <Award size={24} style={{ color: 'var(--green-primary)' }} />
          <strong style={{ fontSize: '16px', fontFamily: 'Poppins, sans-serif' }}>{specs.grade} Quality</strong>
          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>A-Grade certified harvest variety</span>
        </div>
        <div className="glass-stat-card">
          <Scale size={24} style={{ color: 'var(--green-primary)' }} />
          <strong style={{ fontSize: '16px', fontFamily: 'Poppins, sans-serif' }}>{product.quantity} {product.unit || 'kg'}</strong>
          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Total ready-to-load physical inventory</span>
        </div>
        <div className="glass-stat-card">
          <Truck size={24} style={{ color: 'var(--green-primary)' }} />
          <strong style={{ fontSize: '16px', fontFamily: 'Poppins, sans-serif' }}>{specs.delivery}</strong>
          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Ground transit dispatch options</span>
        </div>
        <div className="glass-stat-card">
          <Shield size={24} style={{ color: 'var(--green-primary)' }} />
          <strong style={{ fontSize: '16px', fontFamily: 'Poppins, sans-serif' }}>{specs.cultivation}</strong>
          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>100% verified farming practices</span>
        </div>
      </div>

      {/* Tabs and Sidebar Section */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="premium-tabs-header">
          <button onClick={() => setActiveTab('overview')} className={`premium-tab-trigger ${activeTab === 'overview' ? 'premium-tab-trigger--active' : ''}`}>
            Overview
            <div className="premium-tab-underline" />
          </button>
          <button onClick={() => setActiveTab('specifications')} className={`premium-tab-trigger ${activeTab === 'specifications' ? 'premium-tab-trigger--active' : ''}`}>
            Specifications
            <div className="premium-tab-underline" />
          </button>
          <button onClick={() => setActiveTab('auction')} className={`premium-tab-trigger ${activeTab === 'auction' ? 'premium-tab-trigger--active' : ''}`}>
            Auction History
            <div className="premium-tab-underline" />
          </button>
          <button onClick={() => setActiveTab('discussion')} className={`premium-tab-trigger ${activeTab === 'discussion' ? 'premium-tab-trigger--active' : ''}`}>
            Discussion ({comments.length})
            <div className="premium-tab-underline" />
          </button>
          <button onClick={() => setActiveTab('seller')} className={`premium-tab-trigger ${activeTab === 'seller' ? 'premium-tab-trigger--active' : ''}`}>
            Farmer Profile
            <div className="premium-tab-underline" />
          </button>
          <button onClick={() => setActiveTab('reviews')} className={`premium-tab-trigger ${activeTab === 'reviews' ? 'premium-tab-trigger--active' : ''}`}>
            Reviews
            <div className="premium-tab-underline" />
          </button>
          <button onClick={() => setActiveTab('shipping')} className={`premium-tab-trigger ${activeTab === 'shipping' ? 'premium-tab-trigger--active' : ''}`}>
            Shipping
            <div className="premium-tab-underline" />
          </button>
        </div>

        <div className="tabs-and-sidebar-grid">
          
          {/* Active Tab Panel */}
          <div style={{ minWidth: 0 }}>
            {renderTabContent()}
          </div>

          {/* Sticky Side Card */}
          <div className="hide-on-mobile">
            <div style={{ position: 'sticky', top: '150px' }}>
              <div className="price-box-wrapper" style={{ background: 'var(--glass-bg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Current Price</span>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--green-primary)' }}>₹{priceDisplay}{unitLabel}</div>
                </div>

                <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                  <strong>Min Order Size:</strong> {specs.minOrder}
                </div>

                {isAuction ? (
                  <>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#ef4444', fontWeight: '700', fontSize: '13.5px' }}>
                      <Clock size={14} />
                      <span>{getRemainingTimeLive(product.biddingEndTime)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input 
                        type="number" 
                        value={bidAmount} 
                        onChange={(e) => setBidAmount(e.target.value)} 
                        className="profile-input" 
                        style={{ height: '40px', fontSize: '14px' }}
                      />
                      <button onClick={handlePlaceBidClick} className="liquid-btn liquid-btn-primary" style={{ height: '40px', width: '100%' }}>
                        Submit Bid
                      </button>
                    </div>
                  </>
                ) : (
                  <button onClick={onBuyNow} className="liquid-btn liquid-btn-primary" style={{ width: '100%', height: '40px' }}>
                    Purchase Now
                  </button>
                )}

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={() => onWishlistToggle(product._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    <Heart size={14} fill={wishlist.includes(product._id) ? '#ef4444' : 'none'} color={wishlist.includes(product._id) ? '#ef4444' : 'currentColor'} />
                    <span>{wishlist.includes(product._id) ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                  </button>
                  <button onClick={() => onShare(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    <Share2 size={14} />
                    <span>Copy Product Share Link</span>
                  </button>
                  <button onClick={() => alert('Reported')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '13px' }}>
                    <Flag size={14} />
                    <span>Report Listing</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>Related Crop Listings</h3>
          <div className="horizontal-slider">
            {relatedProducts.map((p) => (
              <div key={p._id} className="related-card" onClick={() => onOpenProduct(p)}>
                <img 
                  src={p.image || p.images?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=300&q=80'} 
                  alt={p.name} 
                  className="related-card__image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=300&q=80';
                  }}
                />
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: '700' }}>{p.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.location.split(',')[0]}</span>
                  <strong style={{ color: 'var(--green-primary)', fontSize: '14.5px' }}>₹{p.highestBid || p.basePrice}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed Section */}
      {recentlyViewedProducts.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>Recently Viewed Listings</h3>
          <div className="horizontal-slider">
            {recentlyViewedProducts.map((p) => (
              <div key={p._id} className="related-card" onClick={() => onOpenProduct(p)}>
                <img 
                  src={p.image || p.images?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=300&q=80'} 
                  alt={p.name} 
                  className="related-card__image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=300&q=80';
                  }}
                />
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: '700' }}>{p.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.location.split(',')[0]}</span>
                  <strong style={{ color: 'var(--green-primary)', fontSize: '14.5px' }}>₹{p.highestBid || p.basePrice}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bid Confirmation Dialog */}
      {showConfirmBid && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', zIndex: '2005', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="details-modal" style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B' }}>
              <Clock size={20} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', fontFamily: 'Poppins, sans-serif' }}>Confirm Bid Proposal</h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              You are about to propose a bid of <strong style={{ color: 'var(--green-primary)' }}>₹{bidAmount}</strong> on <strong>{product.name}</strong>. Bids are binding commitments once verified.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button className="liquid-btn liquid-btn-secondary" style={{ flex: 1, height: '40px' }} onClick={() => setShowConfirmBid(false)}>Cancel</button>
              <button className="liquid-btn liquid-btn-primary" style={{ flex: 1, height: '40px' }} onClick={handleConfirmBid}>Confirm Bid</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Sticky Bidding Bar */}
      <div className="mobile-sticky-bottom-panel">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{isAuction ? 'Highest Bid' : 'Price'}</span>
          <strong style={{ fontSize: '18px', color: 'var(--green-primary)', fontFamily: 'Poppins, sans-serif' }}>₹{priceDisplay}</strong>
        </div>
        {isAuction ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              type="number" 
              value={bidAmount} 
              onChange={(e) => setBidAmount(e.target.value)} 
              className="profile-input" 
              style={{ width: '80px', height: '36px', padding: '4px 8px', fontSize: '13px' }}
            />
            <button onClick={handlePlaceBidClick} className="liquid-btn liquid-btn-primary" style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}>
              Bid
            </button>
          </div>
        ) : (
          <button onClick={onBuyNow} className="liquid-btn liquid-btn-primary" style={{ height: '36px', padding: '0 20px', fontSize: '13px' }}>
            Buy Now
          </button>
        )}
      </div>

    </div>
  );
};

export default ProductDetailsView;
