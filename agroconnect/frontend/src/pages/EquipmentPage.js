import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tractor, 
  Search, 
  Filter, 
  MapPin, 
  User, 
  Star, 
  Clock, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight, 
  DollarSign, 
  Wrench, 
  Phone, 
  Check, 
  X, 
  Trash2, 
  Tag,
  Mic,
  ArrowRight,
  Bookmark,
  Sparkles,
  Award
} from 'lucide-react';
import api from '../utils/auth';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import StatCard from '../components/ui/StatCard';
import { NotificationService } from '../services/NotificationService';
import { useLanguage } from '../contexts/LanguageContext';
import './Equipment.css';

const DEMO_EQUIPMENT = [
  {
    _id: 'eq1',
    name: 'Mahindra Novo 605 DI 4WD Tractor',
    category: 'Tractors',
    brand: 'Mahindra',
    model: '2025 Model (60 HP)',
    description: '60 HP heavy duty 4WD tractor equipped with AC cabin, power steering, dual clutch, and high torque output.',
    image: 'https://images.unsplash.com/photo-1530267981608-bc34111dd461?auto=format&fit=crop&w=800&q=80',
    dailyPrice: 1800,
    hourlyPrice: 350,
    weeklyPrice: 11000,
    securityDeposit: 2000,
    operatorIncluded: true,
    fuelIncluded: false,
    location: 'Nashik, Maharashtra',
    village: 'Pimpalgaon',
    district: 'Nashik',
    state: 'Maharashtra',
    availability: true,
    rating: 4.9,
    verified: true,
    owner: { name: 'Ramesh Patil' }
  },
  {
    _id: 'eq2',
    name: 'Kubota Harvester DC-68G Combine',
    category: 'Harvesters',
    brand: 'Kubota',
    model: '2024 Paddy & Wheat Special',
    description: 'High-speed paddy and wheat combine harvester with rubber crawler tracks.',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    dailyPrice: 4500,
    hourlyPrice: 850,
    weeklyPrice: 28000,
    securityDeposit: 5000,
    operatorIncluded: true,
    fuelIncluded: true,
    location: 'Jalgaon, Maharashtra',
    village: 'Bhadgaon',
    district: 'Jalgaon',
    state: 'Maharashtra',
    availability: true,
    rating: 4.8,
    verified: true,
    owner: { name: 'Suresh Deshmukh' }
  },
  {
    _id: 'eq3',
    name: 'Shaktiman 7 Feet Heavy Duty Rotavator',
    category: 'Rotavators',
    brand: 'Shaktiman',
    model: 'Regular Series (Boron Steel)',
    description: '7 feet wide boron steel tiller blades. Perfect for rapid secondary tillage.',
    image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=800&q=80',
    dailyPrice: 850,
    hourlyPrice: 180,
    weeklyPrice: 5000,
    securityDeposit: 1000,
    operatorIncluded: false,
    fuelIncluded: false,
    location: 'Sangli, Maharashtra',
    village: 'Tasgaon',
    district: 'Sangli',
    state: 'Maharashtra',
    availability: true,
    rating: 4.7,
    verified: true,
    owner: { name: 'Anand Shinde' }
  },
  {
    _id: 'eq4',
    name: 'Agronomy Autonomous Crop Spraying Drone (16L)',
    category: 'Drone',
    brand: 'DJI Agriculture',
    model: 'Agras T20P (16 Liter Tank)',
    description: 'Precision autonomous GPS spray drone. Covers 1 acre in 7 minutes.',
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    dailyPrice: 2500,
    hourlyPrice: 600,
    weeklyPrice: 15000,
    securityDeposit: 3000,
    operatorIncluded: true,
    fuelIncluded: true,
    location: 'Nashik, Maharashtra',
    village: 'Dindori',
    district: 'Nashik',
    state: 'Maharashtra',
    availability: true,
    rating: 4.9,
    verified: true,
    owner: { name: 'Vikram Jadhav' }
  }
];

const DEFAULT_CATEGORIES = [
  'All', 
  'Tractors', 
  'Harvesters', 
  'Rotavators', 
  'Seeders', 
  'Drone', 
  'Sprayer', 
  'Cultivator', 
  'Loader', 
  'Excavator'
];

const EquipmentPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isFarmer, isBuyer, isAdmin } = useAuth();
  const { t } = useLanguage();

  // Tab State: 'browse' | 'my-listings' | 'my-bookings'
  const [activeTab, setActiveTab] = useState('browse');

  // Main Data States
  const [equipmentList, setEquipmentList] = useState(DEMO_EQUIPMENT);
  const [categories, setCategories]       = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading]             = useState(true);

  // Owner & Renter Data States
  const [myListings, setMyListings] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myBookings, setMyBookings] = useState([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filtersOpen, setFiltersOpen]           = useState(false);
  const [maxPriceFilter, setMaxPriceFilter]     = useState(10000);
  const [onlyOperator, setOnlyOperator]         = useState(false);
  const [onlyFuel, setOnlyFuel]                 = useState(false);
  const [verifiedOnly, setVerifiedOnly]         = useState(false);

  // Saved / Bookmark wishlist state
  const [savedEquip, setSavedEquip] = useState(new Set());

  // Modals
  const [selectedItem, setSelectedItem]         = useState(null); // Book Modal item
  const [detailItem, setDetailItem]             = useState(null); // Detail View item
  const [openAddModal, setOpenAddModal]         = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Stats Counters
  const [totalMachinesCount, setTotalMachinesCount] = useState(0);
  const [verifiedOwnersPercent, setVerifiedOwnersPercent] = useState(0);

  // Pre-generate background particles statically to prevent churn
  const EQUIP_PARTICLES = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 80 + 10}%`,
    left: `${Math.random() * 80 + 10}%`,
    size: Math.random() * 5 + 2,
    duration: `${Math.random() * 12 + 12}s`,
    delay: `${Math.random() * 4}s`,
    opacity: Math.random() * 0.20 + 0.05,
  })), []);

  /* Mouse Tilt Parallax for Equipment Cards */
  const handleCardMouseMove = (e, cardId) => {
    if (window.innerWidth < 1024) return;
    const card = document.getElementById(`equip-card-${cardId}`);
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateX = ((yc - y) / yc) * 6; // Max 6 deg tilt
    const rotateY = ((x - xc) / xc) * 6;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
  };

  const handleCardMouseLeave = (cardId) => {
    const card = document.getElementById(`equip-card-${cardId}`);
    if (!card) return;
    card.style.transform = '';
  };

  const toggleSaveEquip = (e, equipId) => {
    e.stopPropagation();
    setSavedEquip(prev => {
      const next = new Set(prev);
      if (next.has(equipId)) {
        next.delete(equipId);
      } else {
        next.add(equipId);
      }
      return next;
    });
  };

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    rentalType: 'daily',
    needOperator: false,
    needFuel: false,
    needDelivery: true,
    renterVillage: user?.address || '',
    renterDistrict: ''
  });

  // Add Equipment Form State
  const [addForm, setAddForm] = useState({
    name: '', category: 'Tractors', brand: '', model: '', description: '', image: '',
    dailyPrice: 1500, hourlyPrice: 250, weeklyPrice: 9000, securityDeposit: 1000,
    operatorIncluded: false, fuelIncluded: false, village: '', district: '', state: 'Maharashtra'
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    if (equipmentList.length > 0) {
      let currentMachines = 0;
      let currentPercent = 0;
      const targetMachines = equipmentList.length;
      const targetPercent = 100;
      
      const duration = 1200; // 1.2s count up duration
      const steps = 40;
      const intervalTime = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        setTotalMachinesCount(Math.min(targetMachines, Math.round((step / steps) * targetMachines)));
        setVerifiedOwnersPercent(Math.min(targetPercent, Math.round((step / steps) * targetPercent)));
        
        if (step >= steps) {
          clearInterval(timer);
        }
      }, intervalTime);
      
      return () => clearInterval(timer);
    }
  }, [equipmentList]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'my-listings' && !isBuyer) {
      fetchOwnerData();
    } else if (isAuthenticated && activeTab === 'my-bookings') {
      fetchRenterData();
    }
  }, [activeTab, isAuthenticated, isBuyer]);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const [eqRes, catRes] = await Promise.all([
        api.get('/equipment'),
        api.get('/equipment/categories')
      ]);
      const eqData = Array.isArray(eqRes.data) ? eqRes.data : (eqRes.data?.equipment || []);
      setEquipmentList(eqData.length > 0 ? eqData : DEMO_EQUIPMENT);
      const catData = Array.isArray(catRes.data) ? catRes.data : [];
      if (catData.length > 0) {
        const merged = Array.from(new Set(['All', ...catData, ...DEFAULT_CATEGORIES]));
        setCategories(merged);
      }
    } catch (err) {
      console.error('Failed to load equipment:', err);
      setEquipmentList(DEMO_EQUIPMENT);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerData = async () => {
    try {
      const res = await api.get('/equipment/my-listings');
      setMyListings(res.data.listings);
      setMyRequests(res.data.requests);
    } catch (err) {
      console.error('Error fetching owner data:', err);
    }
  };

  const fetchRenterData = async () => {
    try {
      const res = await api.get('/equipment/my-bookings');
      setMyBookings(res.data);
    } catch (err) {
      console.error('Error fetching renter data:', err);
    }
  };

  // Filtered Equipment List
  const filteredEquipment = useMemo(() => {
    let list = [...equipmentList];
    if (selectedCategory !== 'All') {
      list = list.filter(e => e.category?.toLowerCase() === selectedCategory.toLowerCase() || (e.category === 'Tractor' && selectedCategory === 'Tractors') || (e.category === 'Harvester' && selectedCategory === 'Harvesters') || (e.category === 'Rotavator' && selectedCategory === 'Rotavators'));
    }
    if (onlyOperator) {
      list = list.filter(e => e.operatorIncluded);
    }
    if (onlyFuel) {
      list = list.filter(e => e.fuelIncluded);
    }
    if (verifiedOnly) {
      list = list.filter(e => e.verified !== false);
    }
    if (maxPriceFilter < 10000) {
      list = list.filter(e => e.dailyPrice <= maxPriceFilter);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => 
        e.name?.toLowerCase().includes(q) || 
        e.brand?.toLowerCase().includes(q) || 
        e.model?.toLowerCase().includes(q) || 
        e.category?.toLowerCase().includes(q) ||
        e.village?.toLowerCase().includes(q) ||
        e.district?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [equipmentList, selectedCategory, searchQuery, onlyOperator, onlyFuel, verifiedOnly, maxPriceFilter]);

  // Dynamic Cost Calculation for Booking Dialog
  const calculatedCost = useMemo(() => {
    if (!selectedItem) return { days: 1, baseRental: 0, distanceCharge: 0, deliveryCharge: 0, operatorCharge: 0, fuelCharge: 0, securityDeposit: 0, totalCost: 0 };
    
    const start = new Date(bookingForm.startDate);
    const end   = new Date(bookingForm.endDate);
    const diffTime = Math.abs(end - start);
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const basePrice = selectedItem.dailyPrice || 1500;
    const baseRental = basePrice * days;
    const distanceKm = 12; // Average local village distance
    const distanceCharge = bookingForm.needDelivery ? distanceKm * 15 : 0;
    const deliveryCharge = bookingForm.needDelivery ? 500 : 0;
    const operatorCharge = bookingForm.needOperator ? (selectedItem.operatorIncluded ? 0 : 600 * days) : 0;
    const fuelCharge = bookingForm.needFuel ? (selectedItem.fuelIncluded ? 0 : 800 * days) : 0;
    const securityDeposit = selectedItem.securityDeposit || 1000;

    const totalCost = baseRental + distanceCharge + deliveryCharge + operatorCharge + fuelCharge + securityDeposit;

    return { days, baseRental, distanceCharge, deliveryCharge, operatorCharge, fuelCharge, securityDeposit, totalCost };
  }, [selectedItem, bookingForm]);

  // Booking Submit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to book machinery.');
      return;
    }
    setBookingSubmitting(true);
    try {
      await api.post('/equipment/book', {
        equipmentId: selectedItem._id,
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate,
        rentalType: bookingForm.rentalType,
        needOperator: bookingForm.needOperator,
        needFuel: bookingForm.needFuel,
        needDelivery: bookingForm.needDelivery,
        renterVillage: bookingForm.renterVillage,
        renterDistrict: bookingForm.renterDistrict
      });
      NotificationService.addNotification({
        title: 'Booking Confirmed',
        message: `Your booking request for ${selectedItem.name} has been submitted to the owner.`,
        type: 'success'
      });
      alert('🎉 Rental booking request submitted! The machinery owner has been notified.');
      setSelectedItem(null);
      setActiveTab('my-bookings');
    } catch (err) {
      alert(err.response?.data?.message || 'Booking submission failed.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Add Equipment Submit
  const handleAddEquipmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/equipment', addForm);
      NotificationService.addNotification({
        title: 'Equipment Listed',
        message: `Your equipment "${addForm.name}" has been listed on the marketplace.`,
        type: 'success'
      });
      alert('✅ Equipment successfully listed in the marketplace!');
      setOpenAddModal(false);
      fetchEquipment();
      if (activeTab === 'my-listings') fetchOwnerData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to list equipment.');
    }
  };

  // Owner Update Booking Status (Accept / Reject / Complete)
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.put(`/equipment/booking/${bookingId}/status`, { status });
      fetchOwnerData();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  // OWNER RESTRICTION FOR BUYER ROLE
  if (isBuyer) {
    return (
      <div className="ds-container" style={{ paddingTop: '40px', paddingBottom: '80px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚜</div>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          Farmer Machinery Sharing Access Only
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
          Peer-to-Peer Agricultural Equipment Sharing is reserved for verified Farmers and Machinery Owners. Buyer accounts do not have access to rental machinery.
        </p>
        <Button variant="primary" onClick={() => navigate('/bidding')}>
          Return to Produce Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="equipment-page">
        {/* ── Aurora Background Blobs ── */}
        <div className="equip-bg" aria-hidden="true">
          <div className="equip-bg__blob equip-bg__blob--1" />
          <div className="equip-bg__blob equip-bg__blob--2" />
          <div className="equip-bg__blob equip-bg__blob--3" />
        </div>

        {/* ── Floating Background Particles ── */}
        <div className="equip-particles" aria-hidden="true">
          {EQUIP_PARTICLES.map(p => (
            <div
              key={p.id}
              className="equip-particle"
              style={{
                top: p.top, left: p.left,
                width: `${p.size}px`, height: `${p.size}px`,
                opacity: p.opacity,
                animationName: `particle-float-${(p.id % 6) + 1}`,
                animationDuration: p.duration,
                animationDelay: p.delay,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
              }}
            />
          ))}
        </div>

        {/* 1. HERO SECTION (Clean hero styled like Guidance) */}
        <section className="equipment-hero">
          <div className="equipment-hero__inner">
            <div className="equipment-hero__content">
              {/* Small pill badges */}
              <div className="equipment-hero__badge-group">
                <span className="hero-floating-badge">
                  🚜 VERIFIED FARM EQUIPMENT
                </span>
                <span className="hero-floating-badge hero-floating-badge--subtle">
                  ✓ Trusted Rental Network
                </span>
              </div>

              <h1 className="equipment-hero__title">
                <span className="reveal-word" style={{ animationDelay: '0.1s' }}>Farm</span>{' '}
                <span className="reveal-word" style={{ animationDelay: '0.2s' }}>Equipment</span>{' '}
                <span className="reveal-word" style={{ animationDelay: '0.3s' }}>Marketplace</span>
              </h1>

              <p className="equipment-hero__subtitle">
                Rent verified agricultural machinery from nearby farmers and trusted providers.
              </p>

              <div className="equipment-hero__actions">
                <button
                  className="btn-guidance-primary hero-btn-glow"
                  onClick={() => {
                    setActiveTab('browse');
                    const el = document.getElementById('equipment-browse-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Tractor size={18} />
                  <span>Browse Equipment</span>
                </button>
                <button
                  className="btn-guidance-secondary hero-btn-outline"
                  onClick={() => setOpenAddModal(true)}
                >
                  <Plus size={18} />
                  <span>List My Equipment</span>
                </button>
              </div>
            </div>

            {/* Compact Telemetry Fleet Card replacing oversized stats */}
            <div className="fleet-summary-card">
              <div className="fleet-summary-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tractor size={20} className="text-gradient-green" />
                  <span style={{ fontWeight: 800, fontSize: '14.5px', color: 'var(--color-text-primary)' }}>Live Fleet Telemetry</span>
                </div>
                <Badge variant="success" style={{ borderRadius: '999px', fontSize: '11px', padding: '3px 10px' }}>Active</Badge>
              </div>
              <div className="fleet-summary-grid">
                <div className="fleet-summary-item">
                  <div className="fleet-lbl">🚜 Available Equipment</div>
                  <div className="fleet-val text-gradient-green">{totalMachinesCount}</div>
                </div>
                <div className="fleet-summary-item">
                  <div className="fleet-lbl">👨‍🌾 Verified Owners</div>
                  <div className="fleet-val text-gradient-blue">{verifiedOwnersPercent}%</div>
                </div>
                <div className="fleet-summary-item">
                  <div className="fleet-lbl">📍 Nearby Rentals</div>
                  <div className="fleet-val">4+ Districts</div>
                </div>
                <div className="fleet-summary-item">
                  <div className="fleet-lbl">⭐ Average Rating</div>
                  <div className="fleet-val text-amber">4.9 / 5</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SEARCH & CATEGORY PILLS SECTION */}
        <div className="equipment-search-container" id="equipment-browse-section">
          <div className="equipment-search-bar-wrap">
            <div className="equipment-search-input-wrap">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search tractors, harvesters, rotavators, seeders..."
                className="equipment-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* Voice icon */}
              <button
                type="button"
                className="search-mic-btn"
                onClick={() => alert("Voice search is coming soon to machinery sharing!")}
                title="Voice Search"
              >
                <Mic size={18} />
              </button>
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={18} />
                </button>
              )}
              {/* Filter button */}
              <button 
                className={`equipment-filter-toggle ${filtersOpen ? 'equipment-filter-toggle--active' : ''}`}
                onClick={() => setFiltersOpen(true)}
              >
                <Filter size={18} />
                <span>Filters</span>
              </button>
            </div>

            {/* 3. CATEGORY PILLS (Only active pill gets green gradient) */}
            <div className="equipment-category-scroll">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`equipment-cat-pill ${selectedCategory === cat ? 'equipment-cat-pill--active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN CONTAINER */}
        <div className="ds-container">
          {/* 7. SEGMENTED PILL TABS */}
          <div className="equipment-tabs-bar">
            <div className="guidance-tabs-wrapper">
              <button 
                className={`guidance-tab-btn ${activeTab === 'browse' ? 'guidance-tab-btn--active' : ''}`} 
                onClick={() => setActiveTab('browse')}
              >
                <Tractor size={16} /> 
                <span>Browse Fleet</span>
                <span className="tab-count-badge">{filteredEquipment.length}</span>
              </button>
              {isAuthenticated && (
                <>
                  <button 
                    className={`guidance-tab-btn ${activeTab === 'my-listings' ? 'guidance-tab-btn--active' : ''}`} 
                    onClick={() => setActiveTab('my-listings')}
                  >
                    <Wrench size={16} /> 
                    <span>My Listed Equipment</span>
                    <span className="tab-count-badge">{myListings.length}</span>
                  </button>
                  <button 
                    className={`guidance-tab-btn ${activeTab === 'my-bookings' ? 'guidance-tab-btn--active' : ''}`} 
                    onClick={() => setActiveTab('my-bookings')}
                  >
                    <Calendar size={16} /> 
                    <span>My Bookings</span>
                    <span className="tab-count-badge">{myBookings.length}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* TAB 1: BROWSE FLEET */}
          {activeTab === 'browse' && (
            <div>
              {loading ? (
                <div className="equipment-grid">
                  {[1, 2, 3, 4].map(n => <Skeleton key={n} height="360px" borderRadius="28px" />)}
                </div>
              ) : filteredEquipment.length === 0 ? (
                /* 9. EMPTY STATE */
                <div className="equipment-empty-state">
                  <div className="empty-icon-wrap">🚜</div>
                  <h3>No Equipment Found</h3>
                  <p>Try changing filters or add your own equipment to the network.</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setOpenAddModal(true)}
                    style={{ borderRadius: '999px', height: '42px', padding: '0 24px', fontSize: '14px' }}
                  >
                    List Equipment
                  </Button>
                </div>
              ) : (
                /* 5. EQUIPMENT CARDS GRID */
                <div className="equipment-grid">
                  {filteredEquipment.map(item => (
                    <div 
                      key={item._id} 
                      id={`equip-card-${item._id}`}
                      className="equipment-card" 
                      onClick={() => setSelectedItem(item)}
                      onMouseMove={(e) => handleCardMouseMove(e, item._id)}
                      onMouseLeave={() => handleCardMouseLeave(item._id)}
                    >
                      <div className="equipment-card__gallery">
                        <img src={item.image} alt={item.name} className="equipment-card__img" />
                        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                          <Badge variant="primary" style={{ borderRadius: '999px', backdropFilter: 'blur(8px)', background: 'rgba(37,99,235,0.85)', color: 'white' }}>
                            {item.category}
                          </Badge>
                          {item.verified !== false && (
                            <Badge variant="success" style={{ borderRadius: '999px', backdropFilter: 'blur(8px)', background: 'rgba(16,185,129,0.9)', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <ShieldCheck size={11} /> Verified
                            </Badge>
                          )}
                        </div>
                        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            className={`equip-bookmark-btn ${savedEquip.has(item._id) ? 'equip-bookmark-btn--active' : ''}`}
                            onClick={(e) => toggleSaveEquip(e, item._id)}
                            title="Save equipment"
                          >
                            <Bookmark size={15} fill={savedEquip.has(item._id) ? '#10B981' : 'none'} color={savedEquip.has(item._id) ? '#10B981' : 'white'} />
                          </button>
                          <Badge variant={item.availability ? 'success' : 'danger'} style={{ borderRadius: '999px', backdropFilter: 'blur(8px)' }}>
                            {item.availability ? 'Available' : 'Rented'}
                          </Badge>
                        </div>
                      </div>

                      <div className="equipment-card__body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                          <h3 className="equipment-card__title">{item.name}</h3>
                        </div>

                        <div className="equipment-card__owner">
                          <User size={13} style={{ color: 'var(--green-primary)' }} />
                          <span>Owner: {item.owner?.name || 'Verified Farmer'}</span>
                        </div>

                        <div className="equipment-card__meta">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} style={{ color: 'var(--blue-primary)' }} />
                            {item.village}, {item.district}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#D97706' }}>
                            <Star size={13} fill="#F59E0B" color="#F59E0B" /> {item.rating}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                          {item.operatorIncluded && <Badge variant="info" style={{ borderRadius: '999px', fontSize: '10.5px' }}>Operator Included</Badge>}
                          {item.fuelIncluded && <Badge variant="warning" style={{ borderRadius: '999px', fontSize: '10.5px' }}>Fuel Included</Badge>}
                        </div>

                        <div className="equipment-card__price-row">
                          <div>
                            <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px', fontWeight: 600 }}>Daily Price</span>
                            <span className="equipment-card__price">₹{item.dailyPrice}<span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>/day</span></span>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            style={{ 
                              borderRadius: '999px',
                              height: '38px',
                              padding: '0 18px',
                              fontSize: '13px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              border: 'none',
                              boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                              transition: 'transform 0.3s var(--ease-spring)'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!item.availability) {
                                alert('This machinery is currently rented out.');
                                return;
                              }
                              setSelectedItem(item);
                            }}
                          >
                            <span>Book Equipment</span>
                            <ArrowRight size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY LISTED MACHINERY */}
          {activeTab === 'my-listings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 className="text-title" style={{ fontSize: '20px', fontWeight: 800 }}>My Listed Equipment ({myListings.length})</h3>
                <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setOpenAddModal(true)} style={{ borderRadius: '999px' }}>
                  List Equipment
                </Button>
              </div>

              {/* Incoming Rental Requests */}
              <div className="equipment-dashboard-card" style={{ padding: '24px', marginBottom: '32px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: 'var(--color-text-primary)' }}>
                  Rental Requests ({myRequests.filter(r => r.status === 'Pending').length} Pending)
                </h4>

                {myRequests.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '14px' }}>No rental requests received yet.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                          <th style={{ padding: '12px' }}>Machinery</th>
                          <th style={{ padding: '12px' }}>Renter</th>
                          <th style={{ padding: '12px' }}>Rental Dates</th>
                          <th style={{ padding: '12px' }}>Total Amount</th>
                          <th style={{ padding: '12px' }}>Status</th>
                          <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myRequests.map(req => (
                          <tr key={req._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '12px', fontWeight: 600 }}>{req.equipment?.name || 'Machinery'}</td>
                            <td style={{ padding: '12px' }}>
                              <div><strong>{req.renter?.name}</strong></div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>📞 {req.renter?.phone || 'N/A'}</div>
                            </td>
                            <td style={{ padding: '12px' }}>
                              {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()} ({req.days} days)
                            </td>
                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--green-primary)' }}>₹{req.totalCost}</td>
                            <td style={{ padding: '12px' }}>
                              <Badge variant={req.status === 'Accepted' ? 'success' : req.status === 'Pending' ? 'warning' : 'danger'} style={{ borderRadius: '999px' }}>
                                {req.status}
                              </Badge>
                            </td>
                            <td style={{ padding: '12px' }}>
                              {req.status === 'Pending' && (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <Button variant="success" size="sm" onClick={() => handleUpdateBookingStatus(req._id, 'Accepted')} style={{ borderRadius: '999px' }}>
                                    Accept
                                  </Button>
                                  <Button variant="danger" size="sm" onClick={() => handleUpdateBookingStatus(req._id, 'Rejected')} style={{ borderRadius: '999px' }}>
                                    Reject
                                  </Button>
                                </div>
                              )}
                              {req.status === 'Accepted' && (
                                <Button variant="primary" size="sm" onClick={() => handleUpdateBookingStatus(req._id, 'Completed')} style={{ borderRadius: '999px' }}>
                                  Complete
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MY BOOKINGS */}
          {activeTab === 'my-bookings' && (
            <div className="equipment-dashboard-card" style={{ padding: '24px' }}>
              <h3 className="text-title" style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>My Rental Bookings</h3>
              {myBookings.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>You have not booked any machinery yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Machinery</th>
                        <th style={{ padding: '12px' }}>Owner</th>
                        <th style={{ padding: '12px' }}>Rental Dates</th>
                        <th style={{ padding: '12px' }}>Amount</th>
                        <th style={{ padding: '12px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myBookings.map(b => (
                        <tr key={b._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>{b.equipment?.name || 'Equipment'}</td>
                          <td style={{ padding: '12px' }}>{b.owner?.name || 'Owner'}</td>
                          <td style={{ padding: '12px' }}>
                            {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()} ({b.days} days)
                          </td>
                          <td style={{ padding: '12px', fontWeight: 700, color: 'var(--green-primary)' }}>₹{b.totalCost}</td>
                          <td style={{ padding: '12px' }}>
                            <Badge variant={b.status === 'Accepted' ? 'success' : b.status === 'Pending' ? 'warning' : 'danger'} style={{ borderRadius: '999px' }}>
                              {b.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 5. ABOUT / INFORMATION SECTION */}
          <section className="equipment-about-section" style={{ marginTop: '56px', marginBottom: '40px' }}>
            <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 40px auto' }}>
              <Badge variant="success" style={{ borderRadius: '999px', marginBottom: '12px', padding: '6px 16px' }}>
                <ShieldCheck size={14} style={{ marginRight: '6px' }} /> Peer-to-Peer Verified Rental Platform
              </Badge>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
                About AgroConnect Machinery Sharing
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
                Empowering farmers and fleet owners with affordable access to modern agricultural machinery. Rent high-efficiency tractors, harvesters, and tilling equipment directly from verified local owners.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div className="equipment-dashboard-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-primary)' }}>
                  <Tractor size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>Verified Machinery Fleet</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                  Every tractor, rotavator, and combine harvester listed undergoes identity & ownership verification before appearing on the public rental marketplace.
                </p>
              </div>

              <div className="equipment-dashboard-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(37,99,235,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <ShieldCheck size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>Transparent Escrow Deposits</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                  Rental payments and security deposits are held in a secure AgroConnect escrow mechanism until equipment is inspected and safely returned.
                </p>
              </div>

              <div className="equipment-dashboard-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                  <Wrench size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>Optional Operator & Fuel</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                  Choose self-driven rental or request certified professional operators along with door-to-door village delivery and fuel inclusions.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* 6. RIGHT-SIDE SLIDE FILTER PANEL */}
        {filtersOpen && (
          <>
            <div className="equipment-drawer-backdrop" onClick={() => setFiltersOpen(false)} />
            <div className="equipment-filter-drawer">
              <div className="equipment-drawer-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={18} className="text-gradient-green" />
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Filter Equipment</h3>
                </div>
                <button className="drawer-close-btn" onClick={() => setFiltersOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="equipment-drawer-body">
                {/* Max Price Range Slider */}
                <div className="drawer-group">
                  <div className="drawer-label-row">
                    <span>Price Range</span>
                    <span className="drawer-val-pill">Up to ₹{maxPriceFilter}/day</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="drawer-range-slider"
                  />
                  <div className="range-min-max">
                    <span>₹500</span>
                    <span>₹10,000</span>
                  </div>
                </div>

                {/* Equipment Type */}
                <div className="drawer-group">
                  <label className="drawer-label">Equipment Type</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="drawer-select"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Toggles */}
                <div className="drawer-group">
                  <label className="drawer-checkbox-label">
                    <input
                      type="checkbox"
                      checked={onlyOperator}
                      onChange={(e) => setOnlyOperator(e.target.checked)}
                    />
                    <span>Professional Operator Included</span>
                  </label>
                  <label className="drawer-checkbox-label">
                    <input
                      type="checkbox"
                      checked={onlyFuel}
                      onChange={(e) => setOnlyFuel(e.target.checked)}
                    />
                    <span>Diesel Fuel Included</span>
                  </label>
                  <label className="drawer-checkbox-label">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                    />
                    <span>Verified Owners Only</span>
                  </label>
                </div>
              </div>

              <div className="equipment-drawer-footer">
                <button
                  className="btn-drawer-secondary"
                  onClick={() => {
                    setMaxPriceFilter(10000);
                    setOnlyOperator(false);
                    setOnlyFuel(false);
                    setVerifiedOnly(false);
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                >
                  Reset
                </button>
                <button className="btn-drawer-primary" onClick={() => setFiltersOpen(false)}>
                  Apply Filters
                </button>
              </div>
            </div>
          </>
        )}

        {/* 8. FLOATING ACTION BUTTON (FAB) */}
        <button
          className="equipment-fab"
          onClick={() => setOpenAddModal(true)}
          title="List Equipment"
        >
          <Plus size={20} />
          <span>+ List Equipment</span>
        </button>

        {/* BOOK RENTAL MODAL */}
        {selectedItem && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedItem(null)}
            title={`Book ${selectedItem.name}`}
            size="md"
          >
            <form onSubmit={handleBookingSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ds-form-group">
                    <label className="ds-label">Start Date</label>
                    <input
                      type="date"
                      value={bookingForm.startDate}
                      onChange={e => setBookingForm(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                      style={{ width: '100%', height: '42px', padding: '0 16px', borderRadius: '999px', border: '1px solid var(--border-color)', background: 'var(--glass-bg)' }}
                    />
                  </div>
                  <div className="ds-form-group">
                    <label className="ds-label">End Date</label>
                    <input
                      type="date"
                      value={bookingForm.endDate}
                      onChange={e => setBookingForm(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                      style={{ width: '100%', height: '42px', padding: '0 16px', borderRadius: '999px', border: '1px solid var(--border-color)', background: 'var(--glass-bg)' }}
                    />
                  </div>
                </div>

                {/* Service Toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={bookingForm.needOperator}
                      onChange={e => setBookingForm(prev => ({ ...prev, needOperator: e.target.checked }))}
                    />
                    <span>Require Professional Operator (₹600/day)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={bookingForm.needFuel}
                      onChange={e => setBookingForm(prev => ({ ...prev, needFuel: e.target.checked }))}
                    />
                    <span>Include Diesel Fuel Supply (₹800/day)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={bookingForm.needDelivery}
                      onChange={e => setBookingForm(prev => ({ ...prev, needDelivery: e.target.checked }))}
                    />
                    <span>Doorstep Farm Delivery & Pickup</span>
                  </label>
                </div>

                {/* Cost Calculation Box */}
                <div className="booking-cost-box">
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 800 }}>Cost Summary</h4>
                  <div className="booking-cost-row">
                    <span>Base Rental ({calculatedCost.days} day(s) @ ₹{selectedItem.dailyPrice}/day):</span>
                    <span>₹{calculatedCost.baseRental}</span>
                  </div>
                  {bookingForm.needOperator && (
                    <div className="booking-cost-row">
                      <span>Operator Fee:</span>
                      <span>₹{calculatedCost.operatorCharge}</span>
                    </div>
                  )}
                  {bookingForm.needFuel && (
                    <div className="booking-cost-row">
                      <span>Fuel Fee:</span>
                      <span>₹{calculatedCost.fuelCharge}</span>
                    </div>
                  )}
                  {bookingForm.needDelivery && (
                    <div className="booking-cost-row">
                      <span>Delivery & Transport:</span>
                      <span>₹{calculatedCost.deliveryCharge + calculatedCost.distanceCharge}</span>
                    </div>
                  )}
                  <div className="booking-cost-row">
                    <span>Security Deposit (Refundable):</span>
                    <span>₹{calculatedCost.securityDeposit}</span>
                  </div>

                  <div className="booking-cost-total">
                    <span>Total Amount Payable</span>
                    <span style={{ color: 'var(--green-primary)', fontSize: '18px' }}>₹{calculatedCost.totalCost}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  loading={bookingSubmitting} 
                  fullWidth
                  style={{ borderRadius: '999px', height: '46px', background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none' }}
                >
                  Confirm Booking Request
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* ADD MACHINERY MODAL */}
        {openAddModal && (
          <Modal
            isOpen={true}
            onClose={() => setOpenAddModal(false)}
            title="List Equipment on Marketplace"
            size="md"
          >
            <form onSubmit={handleAddEquipmentSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="ds-form-group">
                  <label className="ds-label">Equipment Name</label>
                  <input type="text" value={addForm.name} onChange={e => setAddForm(prev => ({ ...prev, name: e.target.value }))} required className="ds-input" style={{ borderRadius: '999px' }} placeholder="e.g. Mahindra Novo 605 DI Tractor" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ds-form-group">
                    <label className="ds-label">Category</label>
                    <select value={addForm.category} onChange={e => setAddForm(prev => ({ ...prev, category: e.target.value }))} className="ds-input" style={{ borderRadius: '999px' }}>
                      {DEFAULT_CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ds-form-group">
                    <label className="ds-label">Brand</label>
                    <input type="text" value={addForm.brand} onChange={e => setAddForm(prev => ({ ...prev, brand: e.target.value }))} placeholder="e.g. Mahindra / Kubota" className="ds-input" style={{ borderRadius: '999px' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ds-form-group">
                    <label className="ds-label">Daily Rental Price (₹)</label>
                    <input type="number" value={addForm.dailyPrice} onChange={e => setAddForm(prev => ({ ...prev, dailyPrice: e.target.value }))} required className="ds-input" style={{ borderRadius: '999px' }} />
                  </div>
                  <div className="ds-form-group">
                    <label className="ds-label">Security Deposit (₹)</label>
                    <input type="number" value={addForm.securityDeposit} onChange={e => setAddForm(prev => ({ ...prev, securityDeposit: e.target.value }))} className="ds-input" style={{ borderRadius: '999px' }} />
                  </div>
                </div>
                <div className="ds-form-group">
                  <label className="ds-label">Village / Location</label>
                  <input type="text" value={addForm.village} onChange={e => setAddForm(prev => ({ ...prev, village: e.target.value, district: e.target.value }))} placeholder="e.g. Pimpalgaon, Nashik" required className="ds-input" style={{ borderRadius: '999px' }} />
                </div>
                <div className="ds-form-group">
                  <label className="ds-label">Description & Specifications</label>
                  <textarea value={addForm.description} onChange={e => setAddForm(prev => ({ ...prev, description: e.target.value }))} rows={3} required className="ds-textarea" style={{ borderRadius: '20px' }} placeholder="Provide horse power, attachments included, condition..." />
                </div>
                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  style={{ marginTop: '12px', borderRadius: '999px', height: '46px', background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none' }}
                >
                  Publish Machinery Listing
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
  );
};

export default EquipmentPage;

