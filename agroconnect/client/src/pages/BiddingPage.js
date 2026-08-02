import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api, { auth } from '../utils/auth';
import SearchBar from '../components/marketplace/SearchBar';
import CategoryPill from '../components/marketplace/CategoryPill';
import ProductCard from '../components/marketplace/ProductCard';
import Pagination from '../components/marketplace/Pagination';
import FilterSidebar from '../components/marketplace/FilterSidebar';
import ProductDetailsView from './ProductDetailsView';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Share2, 
  ShoppingBag, 
  DollarSign, 
  Send, 
  User, 
  Info,
  CheckCircle,
  X,
  Star,
  Shield,
  Calendar,
  ThumbsUp,
  MessageCircle,
  Truck,
  Flag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { NotificationService } from '../services/NotificationService';
import { useLanguage } from '../contexts/LanguageContext';
import '../components/marketplace/Marketplace.css';

// ────────────────────────────────────────────────────────
// PREMIUM DEMO DATASET (12+ ITEMS FOR MAIN CATEGORIES)
// ────────────────────────────────────────────────────────
const DEMO_PRODUCTS = [
  // === FRUITS ===
  {
    _id: 'f1',
    name: 'Kashmiri Red Apples',
    description: 'Freshly harvested crisp red apples from the orchards of Srinagar. Excellent sweet taste and long shelf life.',
    category: 'Fruits',
    quantity: 500,
    unit: 'kg',
    basePrice: 120,
    highestBid: 140,
    location: 'Srinagar, Jammu & Kashmir',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Gopal Singh' },
    isOrganic: true,
    isVerified: true,
    rating: 4.9,
    biddingEndTime: new Date(Date.now() + 86400000 * 3) // 3 days left
  },
  {
    _id: 'f2',
    name: 'Alphonso Mangoes',
    description: 'A-grade Devgad Alphonso mangoes, known for their rich aroma and sweet pulpy flavor. Ideal for direct buyers.',
    category: 'Fruits',
    quantity: 1200,
    unit: 'Dozen',
    basePrice: 600,
    highestBid: 650,
    location: 'Ratnagiri, Maharashtra',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Vilas Mane' },
    isOrganic: false,
    isVerified: true,
    rating: 4.8,
    biddingEndTime: new Date(Date.now() + 86400000 * 2)
  },
  {
    _id: 'f3',
    name: 'Organic Cavendish Bananas',
    description: 'Perfectly ripened chemical-free Cavendish bananas. High in potassium and sweet in flavor.',
    category: 'Fruits',
    quantity: 800,
    unit: 'kg',
    basePrice: 40,
    location: 'Jalgaon, Maharashtra',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Bhaskar Patil' },
    isOrganic: true,
    isVerified: true,
    rating: 4.7
  },
  {
    _id: 'f4',
    name: 'Nagpur Mandarin Oranges',
    description: 'Juicy Nagpur mandarins directly sourced from orchards. High vitamin C content, thin skin.',
    category: 'Fruits',
    quantity: 1500,
    unit: 'kg',
    basePrice: 55,
    highestBid: 60,
    location: 'Nagpur, Maharashtra',
    image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Anil Deshmukh' },
    isOrganic: false,
    isVerified: true,
    rating: 4.6,
    biddingEndTime: new Date(Date.now() + 86400000 * 4)
  },
  {
    _id: 'f5',
    name: 'Seedless Black Grapes',
    description: 'Premium sweet seedless black grapes. Handpicked for export-quality texture and shelf freshness.',
    category: 'Fruits',
    quantity: 1000,
    unit: 'kg',
    basePrice: 90,
    location: 'Nashik, Maharashtra',
    image: 'https://images.unsplash.com/photo-1601275868399-45bec4f4cd9d?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Dattu Yadav' },
    isOrganic: true,
    isVerified: true,
    rating: 4.9
  },
  {
    _id: 'f6',
    name: 'Fresh Pink Guavas',
    description: 'Guavas with soft pink interior and aromatic pulp. Harvested naturally without chemical ripening.',
    category: 'Fruits',
    quantity: 600,
    unit: 'kg',
    basePrice: 65,
    location: 'Allahabad, Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Ram Pal' },
    isOrganic: true,
    isVerified: true,
    rating: 4.5
  },
  {
    _id: 'f7',
    name: 'Red Lady Papaya',
    description: 'Large sized Red Lady papaya. High sweetness, uniform sizing, packed carefully in wooden crates.',
    category: 'Fruits',
    quantity: 2000,
    unit: 'kg',
    basePrice: 35,
    highestBid: 38,
    location: 'Coimbatore, Tamil Nadu',
    image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Murugan Swamy' },
    isOrganic: false,
    isVerified: true,
    rating: 4.7,
    biddingEndTime: new Date(Date.now() + 86400000 * 5)
  },
  {
    _id: 'f8',
    name: 'Sweet Watermelon',
    description: 'Deep red interior, high water content, harvested fresh. Weighs approx 4-7kg per piece.',
    category: 'Fruits',
    quantity: 5000,
    unit: 'kg',
    basePrice: 15,
    location: 'Nellore, Andhra Pradesh',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Venkat Rao' },
    isOrganic: false,
    isVerified: true,
    rating: 4.6
  },
  {
    _id: 'f9',
    name: 'Kabul Pomegranates',
    description: 'Ruby red large arils with high sweetness. High export demand, sorted and graded.',
    category: 'Fruits',
    quantity: 900,
    unit: 'kg',
    basePrice: 150,
    highestBid: 165,
    location: 'Sangli, Maharashtra',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Sandip Salunkhe' },
    isOrganic: true,
    isVerified: true,
    rating: 4.8,
    biddingEndTime: new Date(Date.now() + 86400000 * 6)
  },
  {
    _id: 'f10',
    name: 'Assam Queen Pineapple',
    description: 'Famous juicy Queen Pineapples from the foothills of Silchar. Golden yellow interior.',
    category: 'Fruits',
    quantity: 1100,
    unit: 'Piece',
    basePrice: 45,
    location: 'Silchar, Assam',
    image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Joydev Barua' },
    isOrganic: true,
    isVerified: true,
    rating: 4.8
  },
  {
    _id: 'f11',
    name: 'Shahi Litchi',
    description: 'Fresh Shahi litchi with sweet pulp and thin seeds. Packaged in temperature controlled cartons.',
    category: 'Fruits',
    quantity: 750,
    unit: 'kg',
    basePrice: 160,
    highestBid: 180,
    location: 'Muzaffarpur, Bihar',
    image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Kameshwar Singh' },
    isOrganic: false,
    isVerified: true,
    rating: 4.9,
    biddingEndTime: new Date(Date.now() + 86400000 * 1)
  },
  {
    _id: 'f12',
    name: 'Mahabaleshwar Strawberries',
    description: 'Fresh red strawberries grown on terraced hillsides. Packed in plastic punnets.',
    category: 'Fruits',
    quantity: 300,
    unit: 'kg',
    basePrice: 220,
    location: 'Mahabaleshwar, Maharashtra',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Tanaji Bhilare' },
    isOrganic: true,
    isVerified: true,
    rating: 4.7
  },

  // === VEGETABLES ===
  {
    _id: 'v1',
    name: 'Fresh Potatoes',
    description: 'A-grade high starch russet potatoes, ideal for restaurant suppliers and chip makers.',
    category: 'Vegetables',
    quantity: 4000,
    unit: 'kg',
    basePrice: 20,
    location: 'Indore, Madhya Pradesh',
    image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Rajendra Prasad' },
    isOrganic: false,
    isVerified: true,
    rating: 4.6
  },
  {
    _id: 'v2',
    name: 'Hybrid Salad Tomatoes',
    description: 'Firm round tomatoes with long shelf-life. Harvested semi-ripe for safe logistics transport.',
    category: 'Vegetables',
    quantity: 2500,
    unit: 'kg',
    basePrice: 35,
    highestBid: 42,
    location: 'Kolar, Karnataka',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Mani Gowda' },
    isOrganic: false,
    isVerified: true,
    rating: 4.8,
    biddingEndTime: new Date(Date.now() + 86400000 * 3)
  },
  {
    _id: 'v3',
    name: 'Red Globe Onions',
    description: 'Dry red globe onions with tight skin and strong pungent taste. Export sorting.',
    category: 'Vegetables',
    quantity: 8000,
    unit: 'kg',
    basePrice: 25,
    location: 'Nashik, Maharashtra',
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Praveen Patil' },
    isOrganic: false,
    isVerified: true,
    rating: 4.7
  },
  {
    _id: 'v4',
    name: 'Nandyal Orange Carrots',
    description: 'Sweet, tender orange carrots. Hand washed and bundled, ready for supermarkets.',
    category: 'Vegetables',
    quantity: 1200,
    unit: 'kg',
    basePrice: 40,
    location: 'Nandyal, Andhra Pradesh',
    image: 'https://images.unsplash.com/photo-1444312645910-ffa973656eba?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Ravi Teja' },
    isOrganic: true,
    isVerified: true,
    rating: 4.5
  },
  {
    _id: 'v5',
    name: 'Fresh Flat Cabbage',
    description: 'Crisp green cabbages. Wrapped individually to ensure crispness during transit.',
    category: 'Vegetables',
    quantity: 1800,
    unit: 'kg',
    basePrice: 18,
    location: 'Ooty, Tamil Nadu',
    image: 'https://images.unsplash.com/photo-1550259979-ed79b48d2a30?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Karthik Raja' },
    isOrganic: true,
    isVerified: true,
    rating: 4.7
  },
  {
    _id: 'v6',
    name: 'White Cauliflower Heads',
    description: 'Spotless, compact white cauliflower heads. Directly harvested from the field.',
    category: 'Vegetables',
    quantity: 1000,
    unit: 'kg',
    basePrice: 30,
    highestBid: 35,
    location: 'Sonipat, Haryana',
    image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Satish Kumar' },
    isOrganic: false,
    isVerified: true,
    rating: 4.6,
    biddingEndTime: new Date(Date.now() + 86400000 * 2)
  },
  {
    _id: 'v7',
    name: 'Spinach (Palak) Leaves',
    description: 'Young dark green spinach leaves. Bunched and kept on ice beds for morning delivery.',
    category: 'Vegetables',
    quantity: 500,
    unit: 'kg',
    basePrice: 20,
    location: 'Kanpur, Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Mithilesh Pal' },
    isOrganic: true,
    isVerified: true,
    rating: 4.8
  },
  {
    _id: 'v8',
    name: 'Green Brinjal (Bharta)',
    description: 'Glossy dark purple large brinjals. Perfect shape and soft interior pulp.',
    category: 'Vegetables',
    quantity: 1300,
    unit: 'kg',
    basePrice: 25,
    location: 'Baramati, Maharashtra',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Sanjay Shinde' },
    isOrganic: false,
    isVerified: true,
    rating: 4.4
  },
  {
    _id: 'v9',
    name: 'Tender Lady Finger (Okra)',
    description: 'Fresh green, easy snap okra pods. Grown using certified bio-fertilizers.',
    category: 'Vegetables',
    quantity: 800,
    unit: 'kg',
    basePrice: 45,
    highestBid: 49,
    location: 'Surat, Gujarat',
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Vimal Patel' },
    isOrganic: true,
    isVerified: true,
    rating: 4.7,
    biddingEndTime: new Date(Date.now() + 86400000 * 4)
  },
  {
    _id: 'v10',
    name: 'Green Bell Capsicum',
    description: 'Blocky 3-4 lobed capsicum green peppers. Thick walls, shiny green texture.',
    category: 'Vegetables',
    quantity: 950,
    unit: 'kg',
    basePrice: 60,
    location: 'Karnal, Haryana',
    image: 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Joginder Singh' },
    isOrganic: false,
    isVerified: true,
    rating: 4.6
  },
  {
    _id: 'v11',
    name: 'Orange Pumpkin',
    description: 'Hard skin orange carving and cooking pumpkins. Average weight 3-5kg per piece.',
    category: 'Vegetables',
    quantity: 3000,
    unit: 'kg',
    basePrice: 15,
    location: 'Salem, Tamil Nadu',
    image: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Subramanian V' },
    isOrganic: false,
    isVerified: true,
    rating: 4.5
  },
  {
    _id: 'v12',
    name: 'Sweet Green Peas',
    description: 'Fresh green pea pods. Plump seeds with high sugar concentration.',
    category: 'Vegetables',
    quantity: 700,
    unit: 'kg',
    basePrice: 80,
    highestBid: 95,
    location: 'Shimla, Himachal Pradesh',
    image: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Devinder Thakur' },
    isOrganic: true,
    isVerified: true,
    rating: 4.9,
    biddingEndTime: new Date(Date.now() + 86400000 * 1)
  },

  // === GRAINS ===
  {
    _id: 'g1',
    name: 'Basmati Rice (1121)',
    description: 'Long grain, highly aromatic Basmati Rice 1121. Aged over 12 months for fluffiness.',
    category: 'Grains',
    quantity: 10,
    unit: 'Ton',
    basePrice: 85000,
    highestBid: 92000,
    location: 'Amritsar, Punjab',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Harpreet Singh' },
    isOrganic: false,
    isVerified: true,
    rating: 4.9,
    biddingEndTime: new Date(Date.now() + 86400000 * 5)
  },
  {
    _id: 'g2',
    name: 'Sharbati Wheat',
    description: 'Premium Sharbati wheat grains from Sehore region. High protein content, ideal for chapatis.',
    category: 'Grains',
    quantity: 15,
    unit: 'Ton',
    basePrice: 28000,
    location: 'Sehore, Madhya Pradesh',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Mukesh Choudhary' },
    isOrganic: true,
    isVerified: true,
    rating: 4.8
  },
  {
    _id: 'g3',
    name: 'Yellow Dent Maize',
    description: 'High quality yellow dent corn/maize. Sourced directly for animal feed and starch plants.',
    category: 'Grains',
    quantity: 20,
    unit: 'Ton',
    basePrice: 22000,
    location: 'Gulbarga, Karnataka',
    image: 'https://images.unsplash.com/photo-1470093851219-69951fcbb533?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Koppal Gowda' },
    isOrganic: false,
    isVerified: true,
    rating: 4.5
  },
  {
    _id: 'g4',
    name: 'White Jowar (Sorghum)',
    description: 'Sorghum/Jowar grains dried under solar houses. Cleaned, destoned and ready for milling.',
    category: 'Grains',
    quantity: 5,
    unit: 'Ton',
    basePrice: 35000,
    location: 'Akluj, Maharashtra',
    image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Sambhaji Rao' },
    isOrganic: true,
    isVerified: true,
    rating: 4.7
  },

  // === DAIRY ===
  {
    _id: 'd1',
    name: 'Pure Desi Cow Ghee',
    description: 'Bilona method organic ghee made from A2 milk. Rich in granules and golden in color.',
    category: 'Dairy',
    quantity: 150,
    unit: 'Litre',
    basePrice: 850,
    highestBid: 900,
    location: 'Rohtak, Haryana',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Mahender Singh' },
    isOrganic: true,
    isVerified: true,
    rating: 4.9,
    biddingEndTime: new Date(Date.now() + 86400000 * 3)
  },
  {
    _id: 'd2',
    name: 'Fresh Buffalo Paneer',
    description: 'Soft buffalo milk paneer prepared fresh daily. Block cuts, vacuum sealed in cold-box packaging.',
    category: 'Dairy',
    quantity: 200,
    unit: 'kg',
    basePrice: 320,
    location: 'Anand, Gujarat',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Jignesh Patel' },
    isOrganic: false,
    isVerified: true,
    rating: 4.8
  },

  // === SPICES ===
  {
    _id: 's1',
    name: 'High Curcumin Turmeric',
    description: 'Salem variety turmeric fingers containing more than 5% curcumin. Solar dried.',
    category: 'Spices',
    quantity: 3,
    unit: 'Ton',
    basePrice: 95000,
    location: 'Erode, Tamil Nadu',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Palaniswamy K' },
    isOrganic: true,
    isVerified: true,
    rating: 4.8
  },
  {
    _id: 's2',
    name: 'Guntur Dry Red Chillies',
    description: 'Stemless Guntur Sannam dry red chillies. High heat value and deep red coloration.',
    category: 'Spices',
    quantity: 5,
    unit: 'Ton',
    basePrice: 180000,
    highestBid: 195000,
    location: 'Guntur, Andhra Pradesh',
    image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=600&q=80',
    farmer: { name: 'Naidu Prasad' },
    isOrganic: false,
    isVerified: true,
    rating: 4.7,
    biddingEndTime: new Date(Date.now() + 86400000 * 2)
  }
];

const CATEGORY_MAP = [
  { value: 'All', label: 'All', icon: '✨' },
  { value: 'Fruits', label: 'Fruits', icon: '🍎' },
  { value: 'Vegetables', label: 'Vegetables', icon: '🥬' },
  { value: 'Grains', label: 'Grains', icon: '🌾' },
  { value: 'Dairy', label: 'Dairy', icon: '🥛' },
  { value: 'Meat', label: 'Meat', icon: '🥩' },
  { value: 'Organic', label: 'Organic', icon: '🍯' },
  { value: 'Spices', label: 'Spices', icon: '🧂' },
  { value: 'Pulses', label: 'Pulses', icon: '🥜' },
  { value: 'Flowers', label: 'Flowers', icon: '🌸' },
  { value: 'Herbs', label: 'Herbs', icon: '🌿' },
  { value: 'Dry Fruits', label: 'Dry Fruits', icon: '🥥' },
  { value: 'Mushrooms', label: 'Mushrooms', icon: '🍄' },
  { value: 'Seeds', label: 'Seeds', icon: '🌾' },
  { value: 'Fertilizers', label: 'Fertilizers', icon: '🌱' },
  { value: 'Farm Equipment', label: 'Farm Equipment', icon: '🚜' }
];

const BiddingPage = () => {
  const { t } = useLanguage();
  const user = auth.getCurrentUser();
  const token = localStorage.getItem('token');

  // Unified Products State
  const [backendProducts, setBackendProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filtration
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [listingType, setListingType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Sidebar Filter Options
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [maxPriceLimit, setMaxPriceLimit] = useState(100000);
  const [onlyOrganic, setOnlyOrganic] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Detail Modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeThumbnailIdx, setActiveThumbnailIdx] = useState(0);
  const [bidAmount, setBidAmount] = useState('');
  const [bidsLog, setBidsLog] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wishlist') || '[]');
    } catch (e) {
      console.warn('Failed to parse wishlist from storage:', e);
      return [];
    }
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showConfirmBid, setShowConfirmBid] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(false);
  const [commentSort, setCommentSort] = useState('newest');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isVisible, setIsVisible] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    fetchBackendProducts();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        setTimeout(() => {
          setHasRevealed(true);
        }, 2200);
      } else {
        setIsVisible(false);
      }
    }, { threshold: 0.05 });

    const el = document.querySelector('.marketplace-hero');
    if (el) observer.observe(el);

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  const renderBidChart = () => {
    if (bidsLog.length === 0) return null;
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
    if (!selectedProduct) return null;
    const specs = getCropSpecs(selectedProduct);
    const seller = getSellerProfile(selectedProduct);
    const isAuction = selectedProduct.biddingEndTime && new Date(selectedProduct.biddingEndTime) > new Date();

    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content-panel">
            <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>Product Description</h4>
            <p style={{ lineHeight: '1.6', fontSize: '14.5px', color: 'var(--text-secondary)' }}>{selectedProduct.description}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>Quality Grade:</strong> {specs.grade}</div>
                <div><strong>Harvest Date:</strong> {specs.harvestDate}</div>
                <div><strong>Shelf Life:</strong> {specs.shelfLife}</div>
                <div><strong>Moisture Level:</strong> {specs.moisture}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>Packaging:</strong> {specs.packaging}</div>
                <div><strong>Min Order Qty:</strong> {specs.minOrder}</div>
                <div><strong>Organic Certified:</strong> {selectedProduct.isOrganic ? 'Yes (APEDA Certified)' : 'No'}</div>
                <div><strong>Storage:</strong> {specs.storage}</div>
              </div>
            </div>
          </div>
        );
      case 'specifications':
        return (
          <div className="tab-content-panel">
            <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Technical Specifications</h4>
            <table className="specs-table">
              <tbody>
                <tr>
                  <td className="spec-name">Crop Variety</td>
                  <td className="spec-value">{specs.variety}</td>
                </tr>
                <tr>
                  <td className="spec-name">Total Weight Available</td>
                  <td className="spec-value">{selectedProduct.quantity} {selectedProduct.unit || 'kg'}</td>
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
              <h4 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Auction Dashboard</h4>
              <span className={`premium-badge ${isAuction ? 'premium-badge--auction' : 'premium-badge--buynow'}`}>
                {isAuction ? 'Live Auction' : 'Closed'}
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div><strong>Starting Base Price:</strong> ₹{selectedProduct.basePrice}</div>
                <div><strong>Current Highest Bid:</strong> ₹{selectedProduct.highestBid}</div>
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
              <h5 style={{ margin: '0 0 12px 0' }}>Bidding Timeline</h5>
              <div className="timeline-list">
                {bidsLog.map((log, idx) => (
                  <div key={idx} className={`timeline-card ${idx === 0 ? 'timeline-card--highest' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green-light)', color: 'var(--green-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px' }}>
                          {log.bidder.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong>{log.bidder}</strong>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                            {new Date(log.time).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--green-primary)' }}>₹{log.amount}</span>
                        {idx === 0 && <span style={{ fontSize: '9px', background: 'var(--green-primary)', color: '#fff', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Highest</span>}
                      </div>
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
              <h4 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Community Discussion</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sort By:</span>
                <select 
                  value={commentSort} 
                  onChange={(e) => setCommentSort(e.target.value)}
                  style={{ background: 'var(--bg-body)', color: 'var(--text-dark)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', fontSize: '12.5px' }}
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Popular (Likes)</option>
                </select>
              </div>
            </div>

            <div className="comment-input-row">
              <input 
                type="text" 
                placeholder="Ask a question about the crop quality, price, or logistics..." 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                className="comment-input"
              />
              <button onClick={handlePostComment} className="btn btn-primary" style={{ width: '48px', height: '48px', padding: 0, borderRadius: '12px', justifyContent: 'center' }}>
                <Send size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  
                  <div className="comment-actions">
                    <button className="comment-action-btn" onClick={() => handleLikeComment(c.id)}>
                      <ThumbsUp size={12} /> Like ({c.likes || 0})
                    </button>
                    <button className="comment-action-btn" onClick={() => setReplyingToId(replyingToId === c.id ? null : c.id)}>
                      <MessageCircle size={12} /> Reply
                    </button>
                    <button className="comment-action-btn" style={{ marginLeft: 'auto' }}>
                      <Flag size={12} /> Report
                    </button>
                  </div>

                  {replyingToId === c.id && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="Write a reply..." 
                        value={replyText} 
                        onChange={(e) => setReplyText(e.target.value)} 
                        className="comment-input"
                        style={{ height: '36px', padding: '6px 12px', fontSize: '13px' }}
                      />
                      <button onClick={() => handlePostReply(c.id)} className="btn btn-primary" style={{ height: '36px', padding: '0 12px', borderRadius: '10px', fontSize: '13px' }}>
                        Reply
                      </button>
                    </div>
                  )}

                  {c.replies && c.replies.length > 0 && (
                    <div className="discussion-replies">
                      {c.replies.map((r, rIdx) => (
                        <div key={rIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #047857)', color: '#fff', fontSize: '9px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Verified Farmer Details</h4>
            <div className="seller-profile-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
                  fontSize: '22px',
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                  {seller.name ? seller.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'F'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{seller.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
                    <Shield size={14} style={{ color: 'var(--green-primary)' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--green-primary)' }}>Verified Farmer Partner</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />{seller.location}</div>
                </div>
              </div>

              <div className="seller-stats-grid">
                <div className="seller-stat-box">
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Experience</div>
                  <strong style={{ fontSize: '15px' }}>{seller.experience}</strong>
                </div>
                <div className="seller-stat-box">
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Farm Size</div>
                  <strong style={{ fontSize: '15px' }}>{seller.farmSize}</strong>
                </div>
                <div className="seller-stat-box">
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Completed Auctions</div>
                  <strong style={{ fontSize: '15px' }}>{seller.completedAuctions}</strong>
                </div>
                <div className="seller-stat-box">
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Response Rate</div>
                  <strong style={{ fontSize: '15px' }}>{seller.responseTime}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => alert('Opening private chat connection with farmer...')}>
                  Contact Farmer
                </button>
                <button className="btn btn-outlined" style={{ flex: 1 }} onClick={() => alert('Farmer followed successfully!')}>
                  Follow Profile
                </button>
              </div>
            </div>
          </div>
        );
      case 'reviews':
        return (
          <div className="tab-content-panel">
            <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Buyer Reviews</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '30% 70%', gap: '32px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center', background: 'var(--bg-body)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#f59e0b' }}>{seller.rating}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', margin: '6px 0' }}>
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill="#f59e0b" color="#f59e0b" style={{ margin: '0 1px' }} />)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Based on 48 sales</div>
              </div>
              <div>
                <div className="review-row">
                  <span style={{ width: '40px' }}>5 Star</span>
                  <div className="review-progress-bar"><div className="review-progress-fill" style={{ width: '85%' }}></div></div>
                  <span style={{ width: '30px' }}>85%</span>
                </div>
                <div className="review-row">
                  <span style={{ width: '40px' }}>4 Star</span>
                  <div className="review-progress-bar"><div className="review-progress-fill" style={{ width: '10%' }}></div></div>
                  <span style={{ width: '30px' }}>10%</span>
                </div>
                <div className="review-row">
                  <span style={{ width: '40px' }}>3 Star</span>
                  <div className="review-progress-bar"><div className="review-progress-fill" style={{ width: '5%' }}></div></div>
                  <span style={{ width: '30px' }}>5%</span>
                </div>
                <div className="review-row">
                  <span style={{ width: '40px' }}>2 Star</span>
                  <div className="review-progress-bar"><div className="review-progress-fill" style={{ width: '0%' }}></div></div>
                  <span style={{ width: '30px' }}>0%</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Rajesh M.</strong>
                  <span style={{ fontSize: '11px', background: 'var(--green-light)', color: 'var(--green-primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Verified Purchase</span>
                </div>
                <div style={{ display: 'flex', gap: '2px', margin: '4px 0' }}>
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} fill="#f59e0b" color="#f59e0b" style={{ margin: '0 1px' }} />)}
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '4px 0' }}>Superb crop quality, very clean. The moisture level was spot on. Highly recommended!</p>
              </div>
            </div>
          </div>
        );
      case 'shipping':
        return (
          <div className="tab-content-panel">
            <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Shipping & Logistics Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><strong>Logistics Transit:</strong> Ground Freight via verified agricultural trucks.</div>
                <div><strong>Available delivery locations:</strong> All major states across India (West Bengal, Maharashtra, Punjab, Haryana, etc.).</div>
                <div><strong>Bulk order handling:</strong> Special freight discounts for orders over 10 tons.</div>
                <div><strong>Shipping Insurance:</strong> Free basic crop insurance covers up to 80% loss in transit.</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><strong>Pickup Option:</strong> Direct farm-gate pickup available. Coordinate with farmer directly to waive transport fee.</div>
                <div><strong>Estimated Freight Charges:</strong> Average ₹4-8 per kg depending on location and distance.</div>
                <div><strong>Packaging Type:</strong> Laminated moisture-resistant gunny/PP bags.</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
    if (amount <= selectedProduct.highestBid) {
      alert('Bid must be higher than current highest bid.');
      return;
    }
    setShowConfirmBid(true);
  };

  const getRemainingTimeLive = (endTime) => {
    if (!endTime) return 'Expired';
    const difference = +new Date(endTime) - +currentTime;
    if (difference <= 0) return 'Auction Closed';
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
    return `${hours}h ${minutes}m ${seconds}s left`;
  };

  const fetchBackendProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bidding/products');
      // Format backend products to match frontend keys
      const formatted = res.data.map(p => ({
        ...p,
        highestBid: p.highestBid || p.currentBid || p.basePrice,
        rating: p.rating || 4.7,
        isOrganic: p.isOrganic || p.description?.toLowerCase().includes('organic'),
        isVerified: true
      }));
      setBackendProducts(formatted);
    } catch (err) {
      console.error('Failed to load products from database:', err);
    } finally {
      setLoading(false);
    }
  };

  // 100% Database-driven Products State (No mock or demo fallback arrays)
  const allProducts = useMemo(() => {
    return backendProducts;
  }, [backendProducts]);

  // Derive categories dynamically from active DB products (Hide empty categories)
  const dynamicCategories = useMemo(() => {
    const uniqueFromDB = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));
    const items = [{ value: 'All', label: 'All', icon: '✨' }];
    const iconMap = {
      Fruits: '🍎', Vegetables: '🥬', Grains: '🌾', Dairy: '🥛', Meat: '🥩', Organic: '🍯',
      Spices: '🧂', Pulses: '🥜', Flowers: '🌸', Herbs: '🌿', 'Dry Fruits': '🥥',
      Mushrooms: '🍄', Seeds: '🌾', Fertilizers: '🌱', 'Farm Equipment': '🚜'
    };
    uniqueFromDB.forEach(cat => {
      items.push({
        value: cat,
        label: cat,
        icon: iconMap[cat] || '🌱'
      });
    });
    return items;
  }, [allProducts]);

  // Apply filters and search logic
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Filter query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q) || 
        p.location?.toLowerCase().includes(q)
      );
    }

    // Category Pill Selection
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Listing Type (Auction vs Buy Now)
    if (listingType === 'auction') {
      result = result.filter(p => p.biddingEndTime && new Date(p.biddingEndTime) > new Date());
    } else if (listingType === 'buynow') {
      result = result.filter(p => !p.biddingEndTime || new Date(p.biddingEndTime) <= new Date());
    } else if (listingType === 'organic') {
      result = result.filter(p => p.isOrganic);
    } else if (listingType === 'featured') {
      result = result.filter(p => p.isFeatured || p.rating >= 4.8);
    }

    // Advanced Sidebar Filters
    result = result.filter(p => (p.highestBid || p.basePrice) <= maxPriceLimit);

    if (onlyOrganic) {
      result = result.filter(p => p.isOrganic);
    }
    if (onlyVerified) {
      result = result.filter(p => p.isVerified);
    }
    if (stateFilter.trim()) {
      result = result.filter(p => p.location?.toLowerCase().includes(stateFilter.toLowerCase()));
    }
    if (districtFilter.trim()) {
      result = result.filter(p => p.location?.toLowerCase().includes(districtFilter.toLowerCase()));
    }

    // Sorting
    if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => (a.highestBid || a.basePrice) - (b.highestBid || b.basePrice));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.highestBid || b.basePrice) - (a.highestBid || a.basePrice));
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'nearest') {
      result.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'closing') {
      result.sort((a, b) => new Date(a.biddingEndTime || 0) - new Date(b.biddingEndTime || 0));
    }

    return result;
  }, [allProducts, searchQuery, selectedCategory, listingType, sortBy, maxPriceLimit, onlyOrganic, onlyVerified, stateFilter, districtFilter]);

  // Pagination Math
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setListingType('all');
    setSortBy('latest');
    setMaxPriceLimit(100000);
    setOnlyOrganic(false);
    setOnlyVerified(false);
    setStateFilter('');
    setDistrictFilter('');
    setCurrentPage(1);
  };

  const getCropSpecs = (p) => {
    const name = (p.name || '').toLowerCase();
    const isOrganic = p.isOrganic;
    
    const specs = {
      variety: 'Hybrid F1',
      grade: 'A+ Grade Premium',
      harvestDate: '15 July 2026',
      shelfLife: '15 Days',
      moisture: '12%',
      packaging: 'Jute Bags (50kg)',
      minOrder: `${Math.round(p.quantity * 0.1)} ${p.unit || 'kg'}`,
      storage: 'Store in cool, dry place',
      cultivation: isOrganic ? 'Organic Vermicompost' : 'Standard Field Cultivation',
      temp: '15-18 °C',
      color: 'Natural',
      origin: p.location || 'India',
      delivery: '3-5 business days'
    };

    if (name.includes('apple')) {
      specs.variety = 'Kashmiri Delicious';
      specs.harvestDate = '10 July 2026';
      specs.shelfLife = '30 Days';
      specs.moisture = '84%';
      specs.packaging = 'Wooden Crates (20kg)';
      specs.storage = 'Refrigerated Cold Storage';
      specs.temp = '2-4 °C';
      specs.color = 'Ruby Red';
    } else if (name.includes('potato')) {
      specs.variety = 'Kufri Jyoti';
      specs.harvestDate = '18 July 2026';
      specs.shelfLife = '60 Days';
      specs.moisture = '14%';
      specs.packaging = 'Mesh Bags (50kg)';
      specs.storage = 'Dry dark ventilated warehouse';
      specs.temp = '8-10 °C';
      specs.color = 'Brownish Yellow';
    } else if (name.includes('turmeric')) {
      specs.variety = 'Salem Curcumin';
      specs.harvestDate = '05 June 2026';
      specs.shelfLife = '365 Days';
      specs.moisture = '8%';
      specs.packaging = 'Laminated Poly Bags (25kg)';
      specs.storage = 'Keep in airtight containers';
      specs.temp = 'Room Temperature';
      specs.color = 'Deep Golden Yellow';
    } else if (name.includes('grape')) {
      specs.variety = 'Sharad Seedless';
      specs.harvestDate = '22 July 2026';
      specs.shelfLife = '10 Days';
      specs.moisture = '81%';
      specs.packaging = 'Plastic Punnets (500g)';
      specs.storage = 'Chilled storage';
      specs.temp = '1-2 °C';
      specs.color = 'Dark Purple Black';
    } else if (name.includes('mango')) {
      specs.variety = 'Devgad Hapus';
      specs.harvestDate = '20 July 2026';
      specs.shelfLife = '12 Days';
      specs.moisture = '83%';
      specs.packaging = 'Corrugated Boxes';
      specs.storage = 'Ventilated ripening room';
      specs.temp = '12-15 °C';
      specs.color = 'Golden Saffron';
    } else if (name.includes('tomato')) {
      specs.variety = 'Arka Samrat';
      specs.harvestDate = '21 July 2026';
      specs.shelfLife = '14 Days';
      specs.moisture = '94%';
      specs.packaging = 'Plastic Crates (25kg)';
      specs.storage = 'Cool room';
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
    } else if (name.includes('jowar') || name.includes('sorghum')) {
      specs.variety = 'Maldandi (M35-1)';
      specs.harvestDate = '10 June 2026';
      specs.shelfLife = '365 Days';
      specs.moisture = '10%';
      specs.packaging = 'Gunny Bags (50kg)';
      specs.storage = 'Dry storage';
      specs.temp = 'Ambient';
      specs.color = 'Pearlish White';
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

  // Details Modal handler
  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setActiveThumbnailIdx(0);
    setBidAmount((product.highestBid + 100).toString());
    setBidsLog([
      { bidder: 'Sunil Verma', amount: product.basePrice, time: '2026-07-22T10:00:00Z', isHighest: false },
      { bidder: 'Preet Dhillon', amount: product.highestBid, time: '2026-07-23T12:30:00Z', isHighest: true }
    ]);
    setComments([
      { 
        id: 1, 
        author: 'Baldev Singh', 
        text: 'Grade-A produce, transport was fast. Moisture level was exactly as specified.', 
        date: '2026-07-22',
        isVerified: true,
        likes: 12,
        replies: [
          { author: 'Gopal Singh (Farmer)', text: 'Thank you Baldev! Glad you liked the quality.', date: '2026-07-22' }
        ]
      },
      { 
        id: 2, 
        author: 'Meera Nair', 
        text: 'Available for bulk discount orders? Looking to procure 5+ tons.', 
        date: '2026-07-23',
        isVerified: true,
        likes: 4,
        replies: []
      }
    ]);
    setActiveTab('overview');
  };

  const handlePlaceBid = async (amountArg) => {
    const amount = amountArg || Number(bidAmount);

    try {
      await api.post(`/bidding/products/${selectedProduct._id}/bid`, { amount });
      
      const updatedProduct = {
        ...selectedProduct,
        highestBid: amount,
        totalBids: (selectedProduct.totalBids || 0) + 1
      };
      
      setSelectedProduct(updatedProduct);
      setBackendProducts(backendProducts.map(p => p._id === selectedProduct._id ? updatedProduct : p));
      setBidsLog(prev => [{ bidder: user?.name || 'Anonymous', amount, time: new Date().toISOString() }, ...prev]);
      
      try {
        await api.post('/notifications/test', {
          type: 'bid_accepted',
          title: 'Bid Placed Successfully!',
          message: `Your bid of ₹${amount} was placed on ${selectedProduct.name}.`,
          link: '/bidding'
        });
      } catch (_) {}

      NotificationService.addNotification({
        title: 'Bid Received',
        message: `A new bid of ₹${amount} was placed on ${selectedProduct.name}.`,
        type: 'success'
      });

      alert('Bid placed successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place bid.');
    }
  };

  const handlePostComment = (text) => {
    const commentText = text || newComment;
    if (!commentText.trim()) return;
    const commentObj = {
      id: Date.now(),
      author: user?.name || 'Anonymous User',
      text: commentText,
      date: new Date().toISOString().split('T')[0],
      isVerified: user?.role === 'buyer',
      likes: 0,
      replies: []
    };
    setComments([commentObj, ...comments]);
    setNewComment('');
  };

  const handlePostReply = (commentId, replyTextArg) => {
    const text = replyTextArg || replyText;
    if (!text.trim()) return;
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [
            ...c.replies,
            {
              author: user?.name || 'Anonymous User',
              text: text,
              date: new Date().toISOString().split('T')[0]
            }
          ]
        };
      }
      return c;
    }));
    setReplyText('');
    setReplyingToId(null);
  };

  const handleLikeComment = (commentId) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return { ...c, likes: c.likes + 1 };
      }
      return c;
    }));
  };

  const toggleWishlist = (id) => {
    let updated;
    if (wishlist.includes(id)) {
      updated = wishlist.filter(item => item !== id);
    } else {
      updated = [...wishlist, id];
    }
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const handleShareProduct = (product) => {
    const url = `${window.location.origin}/bidding?id=${product._id}`;
    navigator.clipboard.writeText(url);
    alert('Listing link copied to clipboard!');
  };

  const handleBuyNowSubmit = (e) => {
    e.preventDefault();
    NotificationService.addNotification({
      title: 'Bid Won',
      message: `Purchase authorized for ${selectedProduct.name}. Invoice generated.`,
      type: 'success'
    });
    alert('Payment Authorized successfully! Invoice has been generated.');
    setShowCheckout(false);
    setSelectedProduct(null);
  };

  const getRemainingTime = (endTime) => {
    if (!endTime) return 'Expired';
    const difference = +new Date(endTime) - +new Date();
    if (difference <= 0) return 'Expired';
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    return `${hours}h ${minutes}m left`;
  };

  const isAuction = selectedProduct?.biddingEndTime && new Date(selectedProduct.biddingEndTime) > new Date();
  const priceDisplay = selectedProduct?.highestBid || selectedProduct?.basePrice;
  const unitLabel = selectedProduct?.unit ? `/${selectedProduct.unit}` : '';

  if (selectedProduct) {
    return (
      <>
        <ProductDetailsView
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          user={user}
          token={token}
          onPlaceBid={handlePlaceBid}
          bidsLog={bidsLog}
          comments={comments}
          onPostComment={handlePostComment}
          onPostReply={handlePostReply}
          onLikeComment={handleLikeComment}
          wishlist={wishlist}
          onWishlistToggle={toggleWishlist}
          onShare={handleShareProduct}
          onBuyNow={() => setShowCheckout(true)}
          allProducts={backendProducts}
          onOpenProduct={handleOpenProduct}
        />
        
        {/* CHECKOUT POPUP */}
        {showCheckout && (
          <div className="modal-overlay" style={{ zIndex: '2001' }}>
            <div className="details-modal" style={{ maxWidth: '400px' }}>
              <div className="details-modal__header">
                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{t('marketplace.checkout.title')}</h2>
                <button className="details-modal__close" onClick={() => setShowCheckout(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleBuyNowSubmit} style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="profile-form-group">
                    <label className="profile-label">{t('marketplace.checkout.upiLabel')}</label>
                    <input type="text" placeholder={t('marketplace.checkout.upiPlaceholder')} required className="profile-input" />
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0', padding: '12px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                      <span>{t('marketplace.checkout.amountBilled')}</span>
                      <span>₹{selectedProduct?.highestBid || selectedProduct?.basePrice}</span>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px' }}>
                    {t('marketplace.checkout.confirmPayment')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // Pre-generate background particles statically to prevent churn
  const MARKET_PARTICLES = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 80 + 10}%`,
    left: `${Math.random() * 80 + 10}%`,
    size: Math.random() * 5 + 2,
    duration: `${Math.random() * 12 + 12}s`,
    delay: `${Math.random() * 4}s`,
    opacity: Math.random() * 0.20 + 0.05,
  })), []);

  return (
    <div className="premium-marketplace">
      {/* ── Aurora Background Blobs ── */}
      <div className="market-bg" aria-hidden="true">
        <div className="market-bg__blob market-bg__blob--1" />
        <div className="market-bg__blob market-bg__blob--2" />
        <div className="market-bg__blob market-bg__blob--3" />
      </div>

      {/* ── Floating Background Particles ── */}
      <div className="market-particles" aria-hidden="true">
        {MARKET_PARTICLES.map(p => (
          <div
            key={p.id}
            className="market-particle"
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

      <div className="premium-container">
        
        {/* HERO TITLE */}
        <header className="marketplace-hero" style={{ animation: 'ds-fade-in 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}>
          <h1 className={`marketplace-hero__title ${hasRevealed ? 'lightweight-fade' : ''} ${isVisible ? 'is-visible' : ''}`}>
            {hasRevealed ? (
              t('marketplace.hero.titleFull')
            ) : (
              [t('marketplace.hero.titlePart1'), t('marketplace.hero.titlePart2')].map((word, idx) => (
                <span 
                  key={idx} 
                  className="reveal-word" 
                  style={{ 
                    animationDelay: `${0.35 + idx * 0.10}s, ${1.35 + idx * 0.10}s` 
                  }}
                >
                  {word}
                </span>
              ))
            )}
          </h1>
          <p className="marketplace-hero__subtitle">
            {t('marketplace.hero.subtitle')}
          </p>
        </header>

        {/* 60PX LIQUID GLASS SEARCH */}
        <div style={{ animation: 'ds-fade-in-up 0.6s cubic-bezier(0.16,1,0.3,1) 1.15s both' }}>
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            listingType={listingType}
            onListingTypeChange={setListingType}
            onOpenFilters={() => setFiltersOpen(true)}
          />
        </div>

        {/* HORIZONTAL CATEGORY SCROLL */}
        <div className="category-pills-container" style={{ animation: 'ds-fade-in-up 0.6s cubic-bezier(0.16,1,0.3,1) 1.30s both' }}>
          <div className="category-pills-wrapper">
            {dynamicCategories.map((cat) => (
              <CategoryPill 
                key={cat.value}
                category={cat.label}
                icon={cat.icon}
                isActive={selectedCategory === cat.value}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setCurrentPage(1);
                }}
              />
            ))}
          </div>
        </div>

        {/* PRODUCT LISTING CARD GRID */}
        {loading ? (
          <div className="premium-products-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="skeleton-card" style={{ animation: 'ds-fade-in 0.6s ease both' }}>
                <div className="skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : currentItems.length === 0 ? (
          <div className="empty-state-card">
            <div style={{ fontSize: '56px', marginBottom: '16px', animation: 'float-up-down 3s ease-in-out infinite' }}>🌾</div>
            <h3 className="empty-state-title">{t('marketplace.emptyState.title')}</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px auto', fontSize: '13.5px', lineHeight: 1.5 }}>
              {t('marketplace.emptyState.desc')}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/farmer-dashboard" className="btn btn-primary" style={{ height: '40px', fontSize: '13px' }}>
                {t('marketplace.emptyState.createListing')}
              </Link>
              <button type="button" onClick={resetFilters} className="btn btn-secondary" style={{ height: '40px', fontSize: '13px', borderRadius: '999px' }}>
                {t('marketplace.emptyState.resetFilters')}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ animation: 'ds-fade-in-up 0.7s cubic-bezier(0.16,1,0.3,1) 1.50s both' }}>
            <div className="premium-products-grid">
              {currentItems.map((prod) => (
                <ProductCard 
                  key={prod._id}
                  product={prod}
                  isWishlisted={wishlist.includes(prod._id)}
                  onWishlistToggle={toggleWishlist}
                  onClick={() => handleOpenProduct(prod)}
                />
              ))}
            </div>

            {/* pagination control */}
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

      </div>

      {/* FILTER OVERLAY SIDEBAR */}
      <FilterSidebar 
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        priceRange={maxPriceLimit}
        onPriceRangeChange={setMaxPriceLimit}
        onlyOrganic={onlyOrganic}
        onOrganicToggle={() => setOnlyOrganic(!onlyOrganic)}
        onlyVerified={onlyVerified}
        onVerifiedToggle={() => setOnlyVerified(!onlyVerified)}
        stateFilter={stateFilter}
        onStateFilterChange={setStateFilter}
        districtFilter={districtFilter}
        onDistrictFilterChange={setDistrictFilter}
        onResetFilters={resetFilters}
      />

      {/* CHECKOUT POPUP */}
      {showCheckout && (
        <div className="modal-overlay" style={{ zIndex: '2001' }}>
          <div className="details-modal" style={{ maxWidth: '400px', borderRadius: '32px' }}>
            <div className="details-modal__header">
              <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{t('marketplace.checkout.title')}</h2>
              <button className="details-modal__close" onClick={() => setShowCheckout(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleBuyNowSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="profile-form-group">
                  <label className="profile-label">{t('marketplace.checkout.upiLabel')}</label>
                  <input type="text" placeholder={t('marketplace.checkout.upiPlaceholder')} required className="profile-input" style={{ borderRadius: '999px' }} />
                </div>
                <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0', padding: '12px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                    <span>{t('marketplace.checkout.amountBilled')}</span>
                    <span>₹{selectedProduct?.highestBid || selectedProduct?.basePrice}</span>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px', borderRadius: '999px' }}>
                  {t('marketplace.checkout.confirmPayment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiddingPage;
