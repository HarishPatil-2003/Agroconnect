const express = require('express');

const router = express.Router();

// Sowing guidance
router.get('/sowing', (req, res) => {
  const guidance = {
    title: 'Sowing Guidance',
    content: `
      <h2>Best Practices for Sowing</h2>
      <p>Proper sowing is crucial for successful crop production. Here are key guidelines:</p>
      <ul>
        <li><strong>Soil Preparation:</strong> Ensure soil is well-tilled and free of weeds</li>
        <li><strong>Seed Quality:</strong> Use certified seeds from reliable sources</li>
        <li><strong>Timing:</strong> Sow during optimal seasons for each crop</li>
        <li><strong>Spacing:</strong> Maintain proper distance between seeds/plants</li>
        <li><strong>Depth:</strong> Plant seeds at appropriate depth (usually 2-3 times seed diameter)</li>
        <li><strong>Watering:</strong> Provide adequate moisture after sowing</li>
      </ul>
      <h3>Common Mistakes to Avoid</h3>
      <ul>
        <li>Overcrowding plants</li>
        <li>Sowing in poorly prepared soil</li>
        <li>Ignoring weather conditions</li>
        <li>Using old or damaged seeds</li>
      </ul>
    `
  };
  res.json(guidance);
});

// Harvesting guidance
router.get('/harvesting', (req, res) => {
  const guidance = {
    title: 'Harvesting Guidance',
    content: `
      <h2>Harvesting Best Practices</h2>
      <p>Proper harvesting techniques ensure maximum yield and quality. Key considerations:</p>
      <ul>
        <li><strong>Timing:</strong> Harvest at optimal maturity stage</li>
        <li><strong>Tools:</strong> Use appropriate harvesting tools to avoid damage</li>
        <li><strong>Weather:</strong> Harvest during dry weather when possible</li>
        <li><strong>Handling:</strong> Handle crops gently to prevent bruising</li>
        <li><strong>Storage:</strong> Store harvested crops in proper conditions</li>
        <li><strong>Post-Harvest:</strong> Clean and sort immediately after harvest</li>
      </ul>
      <h3>Harvesting Techniques by Crop Type</h3>
      <ul>
        <li><strong>Leafy Vegetables:</strong> Harvest outer leaves first, allow regrowth</li>
        <li><strong>Fruits:</strong> Pick when fully ripe but firm</li>
        <li><strong>Root Crops:</strong> Gently lift from soil, avoid breaking</li>
        <li><strong>Grains:</strong> Harvest when grains are hard and dry</li>
      </ul>
    `
  };
  res.json(guidance);
});

// Organic farming guidance
router.get('/organic', (req, res) => {
  const guidance = {
    title: 'Organic Farming Guidance',
    content: `
      <h2>Principles of Organic Farming</h2>
      <p>Organic farming focuses on sustainable and environmentally friendly practices:</p>
      <ul>
        <li><strong>Soil Health:</strong> Build healthy soil through composting and natural amendments</li>
        <li><strong>Natural Pest Control:</strong> Use beneficial insects and natural repellents</li>
        <li><strong>Crop Rotation:</strong> Rotate crops to maintain soil fertility and reduce pests</li>
        <li><strong>Organic Fertilizers:</strong> Use compost, manure, and natural mineral sources</li>
        <li><strong>Biodiversity:</strong> Encourage beneficial insects and wildlife</li>
        <li><strong>No Chemicals:</strong> Avoid synthetic pesticides and fertilizers</li>
      </ul>
      <h3>Organic Certification Requirements</h3>
      <ul>
        <li>Three-year transition period</li>
        <li>Regular soil testing</li>
        <li>Detailed record keeping</li>
        <li>Compliance with organic standards</li>
        <li>Third-party verification</li>
      </ul>
      <h3>Benefits of Organic Farming</h3>
      <ul>
        <li>Improved soil health and fertility</li>
        <li>Reduced chemical exposure</li>
        <li>Higher nutritional value</li>
        <li>Environmental sustainability</li>
        <li>Premium market prices</li>
      </ul>
    `
  };
  res.json(guidance);
});

// Get all guidance topics
router.get('/', (req, res) => {
  const topics = [
    { id: 'sowing', title: 'Sowing Guidance', description: 'Best practices for planting and sowing crops' },
    { id: 'harvesting', title: 'Harvesting Guidance', description: 'Proper techniques for harvesting different crops' },
    { id: 'organic', title: 'Organic Farming', description: 'Principles and practices of organic agriculture' }
  ];
  res.json(topics);
});

module.exports = router;
