import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import api from '../utils/auth';

const GuidancePage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [guidance, setGuidance] = useState({});

  useEffect(() => {
    fetchGuidance();
  }, []);

  const fetchGuidance = async () => {
    try {
      const response = await api.get('/guidance');
      setGuidance(response.data);
    } catch (error) {
      console.error('Error fetching guidance:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderGuidanceContent = (content) => {
    if (!content) return <Typography>No content available.</Typography>;

    // If content is HTML string, render it directly
    if (typeof content === 'string') {
      return (
        <div>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      );
    }

    // Fallback for structured content (if API changes in future)
    return (
      <div>
        <Typography variant="h5" gutterBottom>
          {content.title}
        </Typography>
        <Typography variant="body1" paragraph>
          {content.introduction}
        </Typography>

        {content.steps && content.steps.length > 0 && (
          <div>
            <Typography variant="h6" gutterBottom>
              Steps:
            </Typography>
            <ol>
              {content.steps.map((step, index) => (
                <li key={index}>
                  <Typography variant="body2" paragraph>
                    {step}
                  </Typography>
                </li>
              ))}
            </ol>
          </div>
        )}

        {content.tips && content.tips.length > 0 && (
          <div>
            <Typography variant="h6" gutterBottom>
              Tips:
            </Typography>
            <ul>
              {content.tips.map((tip, index) => (
                <li key={index}>
                  <Typography variant="body2" paragraph>
                    {tip}
                  </Typography>
                </li>
              ))}
            </ul>
          </div>
        )}

        {content.benefits && (
          <div>
            <Typography variant="h6" gutterBottom>
              Benefits:
            </Typography>
            <Typography variant="body2" paragraph>
              {content.benefits}
            </Typography>
          </div>
        )}

        {content.conclusion && (
          <div>
            <Typography variant="h6" gutterBottom>
              Conclusion:
            </Typography>
            <Typography variant="body2" paragraph>
              {content.conclusion}
            </Typography>
          </div>
        )}
      </div>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Farming Guidance
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="guidance tabs">
          <Tab label="Sowing Guidance" />
          <Tab label="Harvesting Guidance" />
          <Tab label="Organic Farming" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && (
          <Card>
            <CardContent>
              {renderGuidanceContent(guidance.sowing)}
            </CardContent>
          </Card>
        )}

        {tabValue === 1 && (
          <Card>
            <CardContent>
              {renderGuidanceContent(guidance.harvesting)}
            </CardContent>
          </Card>
        )}

        {tabValue === 2 && (
          <Card>
            <CardContent>
              {renderGuidanceContent(guidance.organic)}
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default GuidancePage;
