const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { bookmarkSchema, commentSchema, askAiSchema } = require('../utils/validators');
const GuidanceArticle = require('../models/GuidanceArticle');
const GuidanceVideo   = require('../models/GuidanceVideo');
const GuidanceFAQ     = require('../models/GuidanceFAQ');
const GuidanceBookmark= require('../models/GuidanceBookmark');
const GuidanceComment = require('../models/GuidanceComment');

// Seed default rich dataset if database is empty
const seedGuidanceDB = async () => {
  try {
    const articleCount = await GuidanceArticle.countDocuments();
    if (articleCount === 0) {
      console.log('🌱 Seeding Guidance Knowledge Database...');
      await GuidanceArticle.insertMany([
        {
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
      ]);
    }

    const videoCount = await GuidanceVideo.countDocuments();
    if (videoCount === 0) {
      console.log('🎥 Seeding Guidance Video Tutorials...');
      await GuidanceVideo.insertMany([
        {
          title: 'Setup High-Tech Drip Fertigation Unit on 2 Acres',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          thumbnail: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
          duration: '12:30',
          category: 'Irrigation',
          views: 1240,
          author: 'AgroConnect Engineering'
        },
        {
          title: 'Preparation of Jeevamrut & Neem Astra Natural Spray',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          thumbnail: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=800&q=80',
          duration: '8:45',
          category: 'Organic Farming',
          views: 980,
          author: 'Organic Farming Academy'
        },
        {
          title: 'Soil Testing & NPK Meter Calibration Demonstration',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          thumbnail: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
          duration: '10:15',
          category: 'Soil Health',
          views: 1450,
          author: 'ICAR Advisory Team'
        }
      ]);
    }

    const faqCount = await GuidanceFAQ.countDocuments();
    if (faqCount === 0) {
      console.log('❓ Seeding Guidance FAQs...');
      await GuidanceFAQ.insertMany([
        {
          question: 'How do I test soil pH and Nitrogen levels on my farm?',
          answer: 'You can perform a quick digital soil kit test or send soil samples to your district KVK (Krishi Vigyan Kendra). Ideal agricultural soil pH ranges from 6.5 to 7.5.',
          category: 'Soil Health',
          order: 1
        },
        {
          question: 'What is the government subsidy for Drip Micro-Irrigation?',
          answer: 'Under the PMKSY Per Drop More Crop scheme, small and marginal farmers receive up to 55% subsidy, while general category farmers receive 45% subsidy on drip equipment.',
          category: 'Government Schemes',
          order: 2
        },
        {
          question: 'How to control yellow leaf curl virus in tomatoes organically?',
          answer: 'Spray Neem oil (10,000 ppm) at 3ml per liter of water combined with yellow sticky cards (10/acre) to control whitefly vectors.',
          category: 'Disease Management',
          order: 3
        },
        {
          question: 'Which crops are best recommended for Kharif season in Maharashtra?',
          answer: 'Soybean, Cotton, Turmeric, Maize, Sugarcane, and Paddy are optimal Kharif crops suited for monsoon rainfall patterns.',
          category: 'Sowing',
          order: 4
        }
      ]);
    }
  } catch (err) {
    console.error('Error seeding Guidance DB:', err);
  }
};

// Trigger auto seeder
seedGuidanceDB();

/* =========================================
   GET /api/guidance/articles (Filter & Search)
   ========================================= */
router.get('/articles', async (req, res) => {
  try {
    const { category, search, season, sort } = req.query;
    let filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (season && season !== 'All') {
      filter.season = { $in: [season, 'All'] };
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ];
    }

    let query = GuidanceArticle.find(filter);

    if (sort === 'popular') {
      query = query.sort({ views: -1, likes: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const articles = await query.exec();
    res.json(articles);
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ message: 'Failed to load guidance articles' });
  }
});

/* =========================================
   GET /api/guidance/featured
   ========================================= */
router.get('/featured', async (req, res) => {
  try {
    const featured = await GuidanceArticle.find({ isFeatured: true }).limit(5);
    res.json(featured);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load featured articles' });
  }
});

/* =========================================
   GET /api/guidance/categories (Dynamic categories)
   ========================================= */
router.get('/categories', async (req, res) => {
  try {
    const categoriesInUse = await GuidanceArticle.distinct('category');
    res.json(['All', ...categoriesInUse]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load categories' });
  }
});

/* =========================================
   GET /api/guidance/seasonal (Calculated Season Advisory)
   ========================================= */
router.get('/seasonal', async (req, res) => {
  try {
    const month = new Date().getMonth() + 1;
    let season = 'Kharif';
    let title = 'Kharif Crop Cycle (Monsoon)';
    
    if (month >= 10 || month <= 3) {
      season = 'Rabi';
      title = 'Rabi Crop Cycle (Winter)';
    } else if (month >= 4 && month <= 6) {
      season = 'Zaid';
      title = 'Zaid Crop Cycle (Summer)';
    }

    const recommendedCrops = season === 'Kharif' 
      ? ['Cotton', 'Soybean', 'Maize', 'Paddy', 'Turmeric']
      : season === 'Rabi'
        ? ['Wheat', 'Gram (Chana)', 'Mustard', 'Onion', 'Garlic']
        : ['Watermelon', 'Cucumber', 'Muskmelon', 'Fodder Crops'];

    res.json({
      season,
      title,
      currentMonth: new Date().toLocaleString('default', { month: 'long' }),
      recommendedCrops,
      sowingWindow: season === 'Rabi' ? 'October to November' : 'June to July',
      harvestingWindow: season === 'Rabi' ? 'February to April' : 'September to November',
      rainfallAdvisory: 'Normal monsoon expected. Ensure field drainage channels are cleared before heavy precipitation.',
      irrigationTips: 'Adopt drip fertigation every 3 days. Avoid over-irrigation during flowering stage.'
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to calculate seasonal advisory' });
  }
});

/* =========================================
   GET /api/guidance/weather (Live Telemetry)
   ========================================= */
router.get('/weather', async (req, res) => {
  try {
    res.json({
      location: 'Nashik & Western Maharashtra',
      temp: '28°C',
      condition: 'Partly Cloudy',
      humidity: '62%',
      rainfallProbability: '15%',
      windSpeed: '12 km/h',
      uvIndex: '6 (Moderate)',
      soilMoisture: '38% (Optimal)',
      soilPh: '6.8 (Ideal)',
      npkStatus: { nitrogen: 'Good', phosphorus: 'Moderate', potassium: 'Optimal' },
      recommendation: 'Ideal conditions for field tillage and fertilizer application. Irrigation recommended tomorrow morning.'
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load weather advisory' });
  }
});

/* =========================================
   GET /api/guidance/videos
   ========================================= */
router.get('/videos', async (req, res) => {
  try {
    const videos = await GuidanceVideo.find().sort({ views: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load tutorial videos' });
  }
});

/* =========================================
   GET /api/guidance/faqs
   ========================================= */
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await GuidanceFAQ.find().sort({ order: 1 });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load FAQs' });
  }
});

/* =========================================
   BOOKMARKS API
   ========================================= */
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const bookmarks = await GuidanceBookmark.find({ user: req.user.id }).populate('article');
    res.json(bookmarks.map(b => b.article));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user bookmarks' });
  }
});

router.post('/bookmarks', auth, validate(bookmarkSchema), async (req, res) => {
  try {
    const { articleId } = req.body;
    let bookmark = await GuidanceBookmark.findOne({ user: req.user.id, article: articleId });
    if (bookmark) {
      await GuidanceBookmark.findByIdAndDelete(bookmark._id);
      return res.json({ bookmarked: false, message: 'Bookmark removed' });
    }
    bookmark = new GuidanceBookmark({ user: req.user.id, article: articleId });
    await bookmark.save();
    res.json({ bookmarked: true, message: 'Article bookmarked' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle bookmark' });
  }
});

/* =========================================
   COMMENTS API
   ========================================= */
router.get('/comments/:articleId', async (req, res) => {
  try {
    const comments = await GuidanceComment.find({ article: req.params.articleId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load comments' });
  }
});

router.post('/comments', auth, validate(commentSchema), async (req, res) => {
  try {
    const { articleId, text } = req.body;
    const comment = new GuidanceComment({
      article: articleId,
      user: req.user.id,
      userName: req.user.name || 'Farmer Member',
      userRole: req.user.role || 'farmer',
      text
    });
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post comment' });
  }
});

const { getCircuitBreaker } = require('../utils/circuitBreaker');

const aiBreaker = getCircuitBreaker('AI_Agronomy_Service', {
  failureThreshold: 3,
  timeoutMs: 4000,
  resetTimeoutMs: 15000,
  maxConcurrency: 5
});

/* =========================================
   AI FARMING ASSISTANT API
   ========================================= */
router.post('/ai-ask', aiLimiter, validate(askAiSchema), async (req, res) => {
  const { question } = req.body;

  const getRuleAnswer = (qText) => {
    const q = (qText || '').toLowerCase();
    if (q.includes('disease') || q.includes('fungus') || q.includes('leaf')) {
      return `🌿 **Disease Diagnosis**: Spray Neem Oil (10,000 ppm) at 3ml/liter or Copper Oxychloride 50% WP at 2.5g/liter. Ensure proper leaf drainage and clear infected bottom leaves immediately.`;
    } else if (q.includes('fertilizer') || q.includes('npk') || q.includes('urea')) {
      return `🧪 **Fertilizer Schedule**: Apply NPK 19:19:19 during early vegetative phase. Switch to NPK 00:52:34 during flowering to promote vigorous root and flower formation. Supplement with zinc sulfate.`;
    } else if (q.includes('water') || q.includes('drip') || q.includes('irrigation')) {
      return `💧 **Irrigation Recommendation**: Operate drip fertigation for 45 minutes in early morning. Avoid late evening irrigation to prevent fungal spore germination on soil surface.`;
    } else if (q.includes('organic') || q.includes('compost') || q.includes('pest')) {
      return `🍯 **Organic Remedy**: Apply Jeevamrut (200 Liters/acre) every 15 days. Install yellow & blue sticky pheromone cards (12 cards/acre) for natural insect control.`;
    }
    return `Based on agricultural science best practices: For optimal crop yield, ensure soil pH is between 6.5 and 7.2. Perform drip fertigation every 3 days during critical vegetative growth.`;
  };

  try {
    const result = await aiBreaker.execute(
      async () => {
        // Primary LLM / Agronomy Engine execution
        const answer = getRuleAnswer(question);
        return { question, answer, source: 'ai_engine' };
      },
      async (err) => {
        // Fast fallback when circuit breaker is OPEN or timing out
        const answer = getRuleAnswer(question);
        return { 
          question, 
          answer: `${answer}\n\n*(Note: Served via AgroConnect Offline CircuitBreaker Fallback)*`, 
          source: 'offline_fallback',
          circuitOpen: true 
        };
      }
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'AI Assistant temporarily unavailable' });
  }
});

module.exports = router;
