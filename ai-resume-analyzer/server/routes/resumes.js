const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Resume = require('../models/Resume');

// POST /api/resumes/upload
router.post('/upload', auth, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'Upload error', message: err.message });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Bad request', message: 'No file uploaded' });
  }

  console.log('File received:', req.file.originalname, req.file.mimetype, req.file.size);

  try {
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    console.log('Sending to analyzer:', process.env.ANALYZER_URL + '/extract');

    const analyzerRes = await axios.post(
      `${process.env.ANALYZER_URL}/extract`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 30000,
      }
    );

    console.log('Analyzer response status:', analyzerRes.status);
    const extractedText = analyzerRes.data.extracted_text;

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(422).json({ error: 'Extraction error', message: 'No text could be extracted from the file.' });
    }

    const resume = await Resume.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      extractedText,
    });

    res.status(201).json({ resumeId: resume._id, message: 'Resume uploaded successfully' });
  } catch (err) {
    console.error('Upload error details:', err.message);
    if (err.response) {
      console.error('Analyzer error response:', err.response.status, JSON.stringify(err.response.data));
      return res.status(422).json({ 
        error: 'Extraction error', 
        message: err.response.data?.detail || 'Could not extract text from the uploaded file.' 
      });
    }
    if (err.code === 'ECONNREFUSED') {
      return res.status(502).json({ error: 'Service unavailable', message: 'Analysis service is not running.' });
    }
    res.status(422).json({ error: 'Extraction error', message: 'Could not extract text from the uploaded file.' });
  }
});

// GET /api/resumes
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).select('_id fileName uploadedAt');
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: 'Internal server error' });
  }
});

module.exports = router;
