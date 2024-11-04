const express = require('express');
const cors = require('cors');
const axios = require('axios');
const getInstagramVideo = require('instagram-url-direct');
const fbDownloader = require('fb-downloader-scrapper');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Helper function to validate URLs
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Download route
app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    let downloadUrl;
    let videoInfo = {};

    if (url.includes('instagram.com')) {
      try {
        const result = await getInstagramVideo(url);
        if (result && result.url_list && result.url_list.length > 0) {
          downloadUrl = result.url_list[0];
          videoInfo = {
            platform: 'Instagram',
            quality: 'HD'
          };
        } else {
          throw new Error('No video URL found');
        }
      } catch (error) {
        console.error('Instagram download error:', error);
        return res.status(400).json({ error: 'Failed to process Instagram video. Please check the URL and try again.' });
      }

    } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
      try {
        const result = await fbDownloader(url);
        if (result && result.length > 0) {
          // Get the highest quality version
          const hdVersion = result.find(v => v.quality === 'HD') || result[0];
          downloadUrl = hdVersion.url;
          videoInfo = {
            platform: 'Facebook',
            quality: hdVersion.quality || 'SD'
          };
        } else {
          throw new Error('No video URL found');
        }
      } catch (error) {
        console.error('Facebook download error:', error);
        return res.status(400).json({ error: 'Failed to process Facebook video. Please check the URL and try again.' });
      }

    } else {
      return res.status(400).json({ 
        error: 'Unsupported platform',
        details: 'We currently only support Instagram and Facebook videos'
      });
    }

    if (!downloadUrl) {
      return res.status(400).json({ error: 'Could not find video download URL' });
    }

    res.json({ 
      downloadUrl,
      videoInfo
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      error: 'Failed to process video',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});