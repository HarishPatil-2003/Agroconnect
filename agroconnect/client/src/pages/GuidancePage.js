import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  Bookmark, 
  Heart, 
  Eye, 
  Clock, 
  User, 
  Sparkles, 
  Bot, 
  Video, 
  HelpCircle, 
  CloudSun, 
  Thermometer, 
  Droplets, 
  Wind, 
  Award, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Send, 
  ThumbsUp, 
  Share2, 
  CheckCircle2, 
  Filter
} from 'lucide-react';
import api from '../utils/auth';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import { useLanguage } from '../contexts/LanguageContext';
import './Guidance.css';

const DEFAULT_ARTICLES = [
  {
    _id: 'g1',
    title: 'Precision Micro-Irrigation & Drip Fertigation for Water Efficiency',
    slug: 'precision-micro-irrigation',
    summary: 'Learn how modern drip fertigation delivers targeted nutrient solution directly to crop root zones, reducing water consumption by 50%.',
    content: `
      <h2>Introduction to Precision Drip Fertigation</h2>
      <p>Drip fertigation combines micro-irrigation with water-soluble fertilizer application directly at root depth. By eliminating surface runoff and evaporation losses, farmers achieve up to 55% water savings while boosting crop yield uniformity.</p>
      
      <h3>Key Benefits</h3>
      <ul>
        <li><strong>Targeted Nutrient Delivery:</strong> Nutrients reach roots instantly without weed uptake.</li>
        <li><strong>Water Conservation:</strong> Saves 40-55% water compared to flood irrigation.</li>
        <li><strong>Energy Efficiency:</strong> Low operational pressure reduces pump electricity costs.</li>
      </ul>

      <h3>System Setup Guidelines</h3>
      <ol>
        <li>Install a disk filter to prevent emitter clogging from sand or organic particles.</li>
        <li>Use pressure-compensating (PC) drippers for sloped land terrains.</li>
        <li>Schedule fertigation during early morning hours to minimize root stress.</li>
      </ol>
    `,
    category: 'Irrigation',
    author: 'Dr. Harish Patil (Agronomist)',
    authorRole: 'Senior Water & Soil Specialist',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    tags: ['Irrigation', 'Drip System', 'Fertigation', 'Water Saving'],
    isFeatured: true,
    views: 520,
    likes: 84,
    season: 'Rabi',
    recommendedCrops: ['Tomato', 'Grapes', 'Sugarcane', 'Cotton']
  },
  {
    _id: 'g2',
    title: 'Organic Vermicompost Production & Soil Health Regeneration',
    slug: 'vermicompost-soil-health',
    summary: 'Master low-cost organic vermicomposting using Eisenia fetida worms to enrich soil organic carbon and natural microbial activity.',
    content: `
      <h2>Restoring Soil Health with Vermicomposting</h2>
      <p>Vermicompost is rich in humus, plant growth hormones (auxins & gibberellins), and beneficial soil bacteria. Utilizing red wriggler earthworms (*Eisenia fetida*) decomposes agricultural waste into high-grade organic fertilizer within 45 to 60 days.</p>
      
      <h3>Step-by-Step Bed Preparation</h3>
      <ul>
        <li><strong>Bed Dimensions:</strong> Construct 6ft x 3ft x 2ft shade beds with brick or HDPE mesh.</li>
        <li><strong>Bedding Material:</strong> Layer shredded coconut coir, paddy straw, and cow dung in a 1:3 ratio.</li>
        <li><strong>Moisture Control:</strong> Maintain 60% moisture level by light daily sprinkling.</li>
      </ul>
    `,
    category: 'Organic Farming',
    author: 'Miss Rupali Pawar',
    authorRole: 'Organic Cultivation Advisor',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=800&q=80',
    tags: ['Organic', 'Vermicompost', 'Soil Carbon', 'Microbes'],
    isFeatured: true,
    views: 410,
    likes: 62,
    season: 'All',
    recommendedCrops: ['All Vegetables', 'Pomegranate', 'Banana', 'Wheat']
  },
  {
    _id: 'g3',
    title: 'Integrated Pest Management (IPM) for Fall Armyworm in Maize',
    slug: 'ipm-fall-armyworm-maize',
    summary: 'Comprehensive biological and chemical control protocols to protect maize crops against destructive Fall Armyworm (Spodoptera frugiperda).',
    content: `
      <h2>Fall Armyworm Identification & Early Detection</h2>
      <p>Fall Armyworm (FAW) poses a serious threat to maize and sorghum crops during the vegetative whorl stage. Early detection using pheromone traps enables timely biological intervention before severe leaf defoliation occurs.</p>
      
      <h3>Biological Control Strategies</h3>
      <ul>
        <li>Install 5 pheromone traps per acre for early pest monitoring.</li>
        <li>Release *Trichogramma chilonis* egg parasitoids at 50,000/acre.</li>
        <li>Apply Neem Oil 1500 ppm at initial egg hatching stage.</li>
      </ul>
    `,
    category: 'Pest Control',
    author: 'Mr. Darshan Ausarkar',
    authorRole: 'Plant Pathology & IPM Specialist',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
    tags: ['IPM', 'Maize', 'Pest Management', 'Biological Control'],
    isFeatured: false,
    views: 310,
    likes: 45,
    season: 'Kharif',
    recommendedCrops: ['Maize', 'Sorghum', 'Sweet Corn']
  },
  {
    _id: 'g4',
    title: 'Solar Cold Storage & Post-Harvest Losses Reduction',
    slug: 'solar-cold-storage-post-harvest',
    summary: 'Prevent perishability and double crop shelf-life using farm-gate solar-powered cold chambers for fruits and vegetables.',
    content: `
      <h2>Zero-Electricity Farm Gate Storage</h2>
      <p>Solar-powered micro cold rooms maintain 4°C to 12°C temperature with 85% humidity. This prevents thermal degradation of harvested produce, giving farmers 21 days of bargaining buffer during market price slumps.</p>
    `,
    category: 'Post Harvest',
    author: 'Dr. Harish Patil (Agronomist)',
    authorRole: 'Agricultural Engineering Lead',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
    tags: ['Post Harvest', 'Cold Storage', 'Solar Energy', 'Shelf Life'],
    isFeatured: false,
    views: 280,
    likes: 39,
    season: 'All',
    recommendedCrops: ['Fruits', 'Vegetables', 'Flowers']
  }
];

const GuidancePage = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  // Data States
  const [articles, setArticles]     = useState(DEFAULT_ARTICLES);
  const [categories, setCategories] = useState(['All', 'Irrigation', 'Organic Farming', 'Pest Control', 'Post Harvest']);
  const [seasonal, setSeasonal]     = useState(null);
  const [weather, setWeather]       = useState(null);
  const [schemes, setSchemes]       = useState([]);
  const [videos, setVideos]         = useState([]);
  const [faqs, setFaqs]             = useState([]);
  const [bookmarks, setBookmarks]   = useState([]);

  // Filter States
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading]                   = useState(true);

  // Active Modals & Readers
  const [selectedArticle, setSelectedArticle]   = useState(null);
  const [comments, setComments]                 = useState([]);
  const [newComment, setNewComment]             = useState('');
  const [selectedVideo, setSelectedVideo]       = useState(null);
  const [openAIModal, setOpenAIModal]           = useState(false);
  const [aiQuestion, setAiQuestion]             = useState('');
  const [aiHistory, setAiHistory]               = useState([]);
  const [aiLoading, setAiLoading]               = useState(false);
  const [openFaqIdx, setOpenFaqIdx]             = useState(null);

  const [telemetryTemp, setTelemetryTemp] = useState(0);
  const [telemetryHumidity, setTelemetryHumidity] = useState(0);
  const [telemetryMoisture, setTelemetryMoisture] = useState(0);
  const [telemetryPh, setTelemetryPh] = useState(0);

  const [isVisible, setIsVisible] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    fetchInitialData();

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

    const el = document.querySelector('.guidance-hero');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (weather) {
      const targetTemp = parseFloat(weather.temp) || 28;
      const targetHum = parseFloat(weather.humidity) || 62;
      const targetMoist = parseFloat(weather.soilMoisture) || 38;
      const targetPh = parseFloat(weather.soilPh) || 6.8;

      const duration = 1200;
      const steps = 40;
      const stepTime = duration / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        setTelemetryTemp(Math.min(targetTemp, Math.round(progress * targetTemp)));
        setTelemetryHumidity(Math.min(targetHum, Math.round(progress * targetHum)));
        setTelemetryMoisture(Math.min(targetMoist, Math.round(progress * targetMoist)));
        setTelemetryPh(Math.min(targetPh, Number((progress * targetPh).toFixed(1))));

        if (step >= steps) clearInterval(timer);
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [weather]);

  const handleCardMouseMove = (e, cardId) => {
    if (window.innerWidth < 1024) return;
    const card = document.getElementById(`guide-card-${cardId}`);
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateX = ((yc - y) / yc) * 6;
    const rotateY = ((x - xc) / xc) * 6;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.01)`;
  };

  const handleCardMouseLeave = (cardId) => {
    const card = document.getElementById(`guide-card-${cardId}`);
    if (!card) return;
    card.style.transform = '';
  };

  const handleTelemetryMouseMove = (e) => {
    if (window.innerWidth < 1024) return;
    const card = document.getElementById(`telemetry-main-card`);
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateX = ((yc - y) / yc) * 5;
    const rotateY = ((x - xc) / xc) * 5;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.01)`;
  };

  const handleTelemetryMouseLeave = () => {
    const card = document.getElementById(`telemetry-main-card`);
    if (!card) return;
    card.style.transform = '';
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [artRes, catRes, seaRes, weaRes, schRes, vidRes, faqRes] = await Promise.allSettled([
        api.get('/guidance/articles'),
        api.get('/guidance/categories'),
        api.get('/guidance/seasonal'),
        api.get('/guidance/weather'),
        api.get('/schemes'),
        api.get('/guidance/videos'),
        api.get('/guidance/faqs')
      ]);

      const fetchedArticles = (artRes.status === 'fulfilled' && Array.isArray(artRes.value.data) && artRes.value.data.length > 0)
        ? artRes.value.data
        : DEFAULT_ARTICLES;

      setArticles(fetchedArticles);

      const fetchedCategories = (catRes.status === 'fulfilled' && Array.isArray(catRes.value.data) && catRes.value.data.length > 0)
        ? catRes.value.data
        : ['All', ...new Set(fetchedArticles.map(a => a.category))];

      setCategories(fetchedCategories);

      if (seaRes.status === 'fulfilled' && seaRes.value.data) setSeasonal(seaRes.value.data);
      if (weaRes.status === 'fulfilled' && weaRes.value.data) setWeather(weaRes.value.data);
      if (schRes.status === 'fulfilled' && Array.isArray(schRes.value.data)) setSchemes(schRes.value.data);
      if (vidRes.status === 'fulfilled' && Array.isArray(vidRes.value.data)) setVideos(vidRes.value.data);
      if (faqRes.status === 'fulfilled' && Array.isArray(faqRes.value.data)) setFaqs(faqRes.value.data);

      if (isAuthenticated) {
        try {
          const bRes = await api.get('/guidance/bookmarks');
          setBookmarks(bRes.data.map(b => b._id || b.id));
        } catch (e) {
          // guest mode
        }
      }
    } catch (err) {
      console.error('Failed to load guidance platform data:', err);
      setArticles(DEFAULT_ARTICLES);
    } finally {
      setLoading(false);
    }
  };

  // Handle Search & Category Filtering
  const filteredArticles = useMemo(() => {
    let list = [...articles];
    if (selectedCategory !== 'All') {
      list = list.filter(a => a.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => 
        a.title?.toLowerCase().includes(q) || 
        a.summary?.toLowerCase().includes(q) || 
        a.category?.toLowerCase().includes(q) ||
        a.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [articles, selectedCategory, searchQuery]);

  const featuredArticles = useMemo(() => {
    return articles.filter(a => a.isFeatured);
  }, [articles]);

  // Toggle Bookmark (Optimistic Update)
  const handleToggleBookmark = async (articleId, e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in to bookmark articles.');
      return;
    }

    const previousBookmarks = [...bookmarks];
    const isBookmarked = bookmarks.includes(articleId);

    // Optimistically update the bookmarks state
    setBookmarks(prev => 
      isBookmarked ? prev.filter(id => id !== articleId) : [...prev, articleId]
    );

    try {
      const res = await api.post('/guidance/bookmarks', { articleId });
      // Reconcile state based on server response just in case
      const isActuallyBookmarked = res.data.bookmarked;
      setBookmarks(prev => {
        const list = prev.filter(id => id !== articleId);
        return isActuallyBookmarked ? [...list, articleId] : list;
      });
    } catch (err) {
      console.error('⚠️ [OPTIMISTIC ROLLBACK] Failed to update bookmark, reverting:', err);
      alert('Failed to update bookmark due to network failure. Reverting state.');
      // Rollback to previous state
      setBookmarks(previousBookmarks);
    }
  };

  // Open Article Reader
  const handleOpenArticle = async (article) => {
    setSelectedArticle(article);
    try {
      const cRes = await api.get(`/guidance/comments/${article._id}`);
      setComments(cRes.data);
    } catch (err) {
      setComments([]);
    }
  };

  // Submit Comment (Optimistic Update)
  const handlePostCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isAuthenticated) {
      alert('Please log in to post comments.');
      return;
    }

    const originalCommentText = newComment;
    const tempId = 'temp-' + Date.now();
    const tempComment = {
      _id: tempId,
      article: selectedArticle._id,
      user: user?.id || 'guest',
      userName: user?.name || 'Farmer Member',
      userRole: user?.role || 'farmer',
      text: originalCommentText,
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };

    const previousComments = [...comments];

    // Optimistically add the comment immediately and clear the input
    setComments(prev => [tempComment, ...prev]);
    setNewComment('');

    try {
      const res = await api.post('/guidance/comments', {
        articleId: selectedArticle._id,
        text: originalCommentText
      });
      // Reconcile: Replace the optimistic temporary comment with the server-saved comment
      setComments(prev => prev.map(c => c._id === tempId ? res.data : c));
    } catch (err) {
      console.error('⚠️ [OPTIMISTIC ROLLBACK] Failed to post comment, reverting:', err);
      alert('Failed to submit comment due to a server error. Your text has been restored.');
      // Rollback: Remove the optimistic comment and restore user input text
      setComments(previousComments);
      setNewComment(originalCommentText);
    }
  };

  // Submit AI Question
  const handleAskAISubmit = async (e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    const q = aiQuestion;
    setAiQuestion('');
    setAiLoading(true);
    setAiHistory(prev => [...prev, { sender: 'user', text: q }]);

    try {
      const res = await api.post('/guidance/ai-ask', { question: q });
      setAiHistory(prev => [...prev, { sender: 'ai', text: res.data.answer }]);
    } catch (err) {
      setAiHistory(prev => [...prev, { sender: 'ai', text: 'Sorry, I could not process your question at this moment.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="guidance-page">
        {/* ── Aurora Background Blobs ── */}
        <div className="guide-bg" aria-hidden="true">
          <div className="guide-bg__blob guide-bg__blob--1" />
          <div className="guide-bg__blob guide-bg__blob--2" />
          <div className="guide-bg__blob guide-bg__blob--3" />
        </div>

        {/* ── Floating Background Particles ── */}
        <div className="guide-particles" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="guide-particle"
              style={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
                width: `${Math.random() * 5 + 2}px`,
                height: `${Math.random() * 5 + 2}px`,
                opacity: Math.random() * 0.15 + 0.05,
                animation: `particle-float-${(i % 6) + 1} ${Math.random() * 12 + 12}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        {/* HERO SECTION */}
        <section className="guidance-hero">
          <div className="guidance-hero__inner">
            <div>
              <div className="guidance-hero__badge-group">
                <Badge variant="success" style={{ animationDelay: '0.05s' }}>🌾 Smart Agronomy Hub</Badge>
                {seasonal && <Badge variant="primary" style={{ animationDelay: '0.10s' }}>{seasonal.season} Season ({seasonal.currentMonth})</Badge>}
                <Badge variant="info" style={{ animationDelay: '0.15s' }}>Verified Expert Advice</Badge>
              </div>

              <h1 className={`guidance-hero__title ${hasRevealed ? 'lightweight-fade' : ''} ${isVisible ? 'is-visible' : ''}`}>
                {hasRevealed ? (
                  t('guidance.hero.titleFull')
                ) : (
                  t('guidance.hero.titleFull').split(' ').map((word, idx) => (
                    <span 
                      key={idx} 
                      className="reveal-word" 
                      style={{ 
                        animationDelay: `${0.35 + idx * 0.08}s, ${1.35 + idx * 0.08}s` 
                      }}
                    >
                      {word}
                    </span>
                  ))
                )}
              </h1>

              <p className="guidance-hero__subtitle">
                {t('guidance.hero.subtitle')}
              </p>

              <div style={{ display: 'flex', gap: 'var(--space-4)', opacity: 0, transform: 'translateY(15px)', animation: 'badge-enter 700ms cubic-bezier(0.16,1,0.3,1) 1.15s forwards' }}>
                <Button variant="primary" size="lg" className="ask-ai-btn" leftIcon={<Sparkles size={18} />} onClick={() => setOpenAIModal(true)} style={{ borderRadius: '999px', transition: 'all 0.3s var(--ease-spring)' }}>
                  {t('guidance.ai.askButton')}
                </Button>
                <Button variant="secondary" size="lg" leftIcon={<Video size={18} />} onClick={() => {
                  const el = document.getElementById('video-hub');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} style={{ borderRadius: '999px', transition: 'all 0.3s var(--ease-spring)' }}>
                  Watch Video Guides
                </Button>
              </div>
            </div>

            {/* Weather & Soil Telemetry Card */}
            {weather && (
              <div className="telemetry-card" id="telemetry-main-card" onMouseMove={handleTelemetryMouseMove} onMouseLeave={handleTelemetryMouseLeave}>
                <div className="telemetry-header">
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: 'var(--text-lg)' }}>{t('guidance.weather.title')}</h4>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{weather.location}</span>
                  </div>
                  <CloudSun size={28} style={{ color: 'var(--color-warning)' }} />
                </div>

                <div className="telemetry-grid">
                  <div className="telemetry-item">
                    <span className="telemetry-label">{t('guidance.weather.temp')}</span>
                    <span className="telemetry-val">{telemetryTemp}°C</span>
                  </div>
                  <div className="telemetry-item">
                    <span className="telemetry-label">{t('guidance.weather.humidity')}</span>
                    <span className="telemetry-val">{telemetryHumidity}%</span>
                  </div>
                  <div className="telemetry-item">
                    <span className="telemetry-label">{t('guidance.weather.moisture')}</span>
                    <span className="telemetry-val">{telemetryMoisture}%</span>
                  </div>
                  <div className="telemetry-item">
                    <span className="telemetry-label">{t('guidance.weather.ph')}</span>
                    <span className="telemetry-val">{telemetryPh}</span>
                  </div>
                </div>

                <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '20px', fontSize: 'var(--text-xs)', color: 'var(--color-success)', fontWeight: 600 }}>
                  💡 {weather.recommendation}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FLOATING SEARCH BAR & DYNAMIC CATEGORIES */}
        <div className="guidance-search-bar">
          <div className="guidance-search-input-wrap">
            <Search size={20} style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by crop, disease, weather, government scheme, pest control..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="guidance-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            )}
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)', cursor: 'pointer', marginRight: '8px' }}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
          </div>

          {/* Dynamic Categories Pills */}
          <div className="guidance-category-scroll" style={{ marginTop: 'var(--space-4)', opacity: 0, transform: 'translateY(15px)', animation: 'badge-enter 700ms cubic-bezier(0.16,1,0.3,1) 1.45s forwards' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`guidance-cat-pill ${selectedCategory === cat ? 'guidance-cat-pill--active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="ds-container">
          {/* FEATURED GUIDANCE ARTICLES SECTION */}
          {featuredArticles.length > 0 && selectedCategory === 'All' && !searchQuery && (
            <section style={{ marginBottom: 'var(--space-12)' }}>
              <h2 className="text-display-sm" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award style={{ color: 'var(--color-primary-600)' }} /> Featured Agronomy Guides
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
                {featuredArticles.map((art) => (
                  <div key={art._id} className="guidance-card" id={`guide-card-${art._id}`} onMouseMove={(e) => handleCardMouseMove(e, art._id)} onMouseLeave={() => handleCardMouseLeave(art._id)} onClick={() => handleOpenArticle(art)}>
                    <div className="guidance-card__img-wrap">
                      <img src={art.image} alt={art.title} className="guidance-card__img" />
                      <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        <Badge variant="success" style={{ borderRadius: '999px' }}>{art.category}</Badge>
                      </div>
                      <button
                        onClick={(e) => handleToggleBookmark(art._id, e)}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(0,0,0,0.6)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Bookmark size={18} fill={bookmarks.includes(art._id) ? '#10B981' : 'none'} color="#ffffff" />
                      </button>
                    </div>

                    <div className="guidance-card__content">
                      <h3 className="guidance-card__title">{art.title}</h3>
                      <p className="guidance-card__summary">{art.summary}</p>
                      
                      <div className="guidance-card__footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={13} />
                          <span>{art.author}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span><Clock size={12} /> {art.readTime}</span>
                          <span><Eye size={12} /> {art.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* LATEST ARTICLES GRID */}
          <section style={{ marginBottom: 'var(--space-12)' }}>
            <h2 className="text-display-sm" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen style={{ color: 'var(--color-primary-600)' }} /> Knowledge Directory
            </h2>

            {loading ? (
              <div className="guidance-grid">
                {[1, 2, 3, 4].map(n => <Skeleton key={n} height="280px" borderRadius="36px" />)}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px var(--space-6)', background: 'var(--glass-bg)', borderRadius: '36px', border: '1.5px dashed var(--glass-border)', backdropFilter: 'var(--glass-blur)', webkitBackdropFilter: 'var(--glass-blur)' }}>
                <BookOpen size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }} />
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>No Guidance Articles Found</h3>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                  No published articles found matching category "{selectedCategory}" or search "{searchQuery}".
                </p>
                <Button variant="outline" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}>
                  Reset Search & Filters
                </Button>
              </div>
            ) : (
              <div className="guidance-grid">
                {filteredArticles.map(art => (
                  <div key={art._id} className="guidance-card" id={`guide-card-${art._id}`} onMouseMove={(e) => handleCardMouseMove(e, art._id)} onMouseLeave={() => handleCardMouseLeave(art._id)} onClick={() => handleOpenArticle(art)}>
                    <div className="guidance-card__img-wrap">
                      <img src={art.image} alt={art.title} className="guidance-card__img" />
                      <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        <Badge variant="primary" style={{ borderRadius: '999px' }}>{art.category}</Badge>
                      </div>
                      <button
                        onClick={(e) => handleToggleBookmark(art._id, e)}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(0,0,0,0.6)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Bookmark size={18} fill={bookmarks.includes(art._id) ? '#10B981' : 'none'} color="#ffffff" />
                      </button>
                    </div>

                    <div className="guidance-card__content">
                      <h3 className="guidance-card__title">{art.title}</h3>
                      <p className="guidance-card__summary">{art.summary}</p>
                      
                      <div className="guidance-card__footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={13} />
                          <span>{art.author}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span><Clock size={12} /> {art.readTime}</span>
                          <span><Eye size={12} /> {art.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* GOVERNMENT SCHEMES SECTION */}
          {schemes.length > 0 && (
            <section style={{ marginBottom: 'var(--space-12)' }}>
              <h2 className="text-display-sm" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award style={{ color: 'var(--color-primary-600)' }} /> Government Agricultural Schemes
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
                {schemes.map(sch => (
                  <div key={sch._id} className="government-scheme-card" id={`guide-card-${sch._id}`} onMouseMove={(e) => handleCardMouseMove(e, sch._id)} onMouseLeave={() => handleCardMouseLeave(sch._id)} style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <Badge variant="warning" style={{ alignSelf: 'flex-start', marginBottom: '12px', borderRadius: '999px' }}>{sch.category || 'Financial Aid'}</Badge>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: '8px' }}>{sch.title}</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', flex: 1, marginBottom: '16px' }}>{sch.description}</p>
                    <div style={{ fontSize: 'var(--text-xs)', background: 'var(--color-surface-2)', padding: '12px', borderRadius: '20px', marginBottom: '16px' }}>
                      <div><strong>Eligibility:</strong> {sch.eligibility}</div>
                      <div style={{ marginTop: '4px' }}><strong>Benefits:</strong> {sch.benefits}</div>
                    </div>
                    <a href={sch.link || 'https://pmkisan.gov.in'} target="_blank" rel="noopener noreferrer">
                      <Button variant="primary" size="sm" fullWidth rightIcon={<ExternalLink size={14} />} style={{ borderRadius: '999px' }}>
                        Official Portal & Apply
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* VIDEO TUTORIALS HUB */}
          {videos.length > 0 && (
            <section id="video-hub" style={{ marginBottom: 'var(--space-12)' }}>
              <h2 className="text-display-sm" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video style={{ color: 'var(--color-primary-600)' }} /> Video Tutorials & Demonstrations
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
                {videos.map(v => (
                  <div key={v._id} className="guidance-card" id={`guide-card-${v._id}`} onMouseMove={(e) => handleCardMouseMove(e, v._id)} onMouseLeave={(e) => handleCardMouseLeave(v._id)} onClick={() => setSelectedVideo(v)}>
                    <div className="guidance-card__img-wrap">
                      <img src={v.thumbnail} alt={v.title} className="guidance-card__img" />
                      <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.8)', color: '#ffffff', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 'bold' }}>
                        {v.duration}
                      </div>
                    </div>
                    <div className="guidance-card__content">
                      <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 800, margin: '0 0 8px 0' }}>{v.title}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'auto' }}>
                        <span>{v.author}</span>
                        <span>{v.views} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQ ACCORDION */}
          {faqs.length > 0 && (
            <section style={{ marginBottom: 'var(--space-12)' }}>
              <h2 className="text-display-sm" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle style={{ color: 'var(--color-primary-600)' }} /> Frequently Asked Questions
              </h2>

              <div className="faq-accordion">
                {faqs.map((faq, idx) => (
                  <div key={faq._id} className="faq-item">
                    <div className="faq-question" onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}>
                      <span>{faq.question}</span>
                      {openFaqIdx === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                    {openFaqIdx === idx && (
                      <div className="faq-answer">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* FLOATING AI ASSISTANT FAB BUTTON */}
        <button className="ai-fab" onClick={() => setOpenAIModal(true)}>
          <Bot size={22} />
          <span>Ask AI Agronomist</span>
        </button>

        {/* ARTICLE READER MODAL WITH COMMENTS */}
        {selectedArticle && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedArticle(null)}
            title={selectedArticle.title}
            size="lg"
          >
            <div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <Badge variant="primary">{selectedArticle.category}</Badge>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>By {selectedArticle.author}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>• {selectedArticle.readTime}</span>
              </div>

              <img src={selectedArticle.image} alt={selectedArticle.title} style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }} />

              <div 
                style={{ fontSize: 'var(--text-base)', lineHeight: 1.7, color: 'var(--color-text-primary)' }}
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }} 
              />

              {/* COMMENTS SECTION */}
              <div style={{ marginTop: '32px', borderTop: '2px solid var(--color-border)', paddingTop: '24px' }}>
                <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: '16px' }}>Member Discussion & Questions ({comments.length})</h4>

                {isAuthenticated ? (
                  <form onSubmit={handlePostCommentSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <input
                      type="text"
                      placeholder="Ask a question or share your field experience..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      style={{ flex: 1, padding: '0 14px', height: '44px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text-primary)' }}
                    />
                    <Button type="submit" variant="primary">Post</Button>
                  </form>
                ) : (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '16px' }}>Please log in to participate in the agronomy discussion.</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {comments.map(c => (
                    <div 
                      key={c._id} 
                      style={{ 
                        padding: '12px', 
                        background: 'var(--color-surface-2)', 
                        borderRadius: 'var(--radius-md)',
                        opacity: c.isOptimistic ? 0.6 : 1,
                        transition: 'opacity 0.25s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: 'var(--text-sm)' }}>{c.userName} ({c.userRole})</strong>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {c.isOptimistic ? (
                            <span style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>Sending...</span>
                          ) : (
                            new Date(c.createdAt).toLocaleDateString()
                          )}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* VIDEO PLAYER MODAL */}
        {selectedVideo && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedVideo(null)}
            title={selectedVideo.title}
            size="md"
          >
            <div>
              <iframe
                src={selectedVideo.videoUrl}
                title={selectedVideo.title}
                style={{ width: '100%', height: '350px', border: 'none', borderRadius: 'var(--radius-lg)' }}
                allowFullScreen
              />
            </div>
          </Modal>
        )}

        {/* AI FARMING ASSISTANT MODAL */}
        <Modal
          isOpen={openAIModal}
          onClose={() => setOpenAIModal(false)}
          title="🤖 AI Agronomy & Crop Advisory Assistant"
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '420px' }}>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--color-success)' }}>
                👋 Hello! I am your AI Agronomist. Ask me anything about crop diseases, organic fertilizers, soil health, pest control, or irrigation schedules!
              </div>

              {aiHistory.map((item, i) => (
                <div key={i} style={{
                  alignSelf: item.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: item.sender === 'user' ? 'var(--color-primary-600)' : 'var(--color-surface-2)',
                  color: item.sender === 'user' ? '#ffffff' : 'var(--color-text-primary)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  maxWidth: '85%',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 1.5
                }}>
                  {item.text}
                </div>
              ))}

              {aiLoading && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>AI Agronomist is analyzing soil & crop data…</div>}
            </div>

            <form onSubmit={handleAskAISubmit} style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <input
                type="text"
                placeholder="e.g. How to treat tomato yellow leaf curl virus?"
                value={aiQuestion}
                onChange={e => setAiQuestion(e.target.value)}
                style={{ flex: 1, height: '44px', padding: '0 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text-primary)' }}
              />
              <Button type="submit" variant="primary" loading={aiLoading}>Ask AI</Button>
            </form>
          </div>
        </Modal>
      </div>
  );
};

export default GuidancePage;
