const express = require('express');
const router = express.Router();
const axios = require('axios');
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

  try {
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const analyzerRes = await axios.post(
      `${process.env.ANALYZER_URL}/extract`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 30000,
      }
    );

    const extractedText = analyzerRes.data.extracted_text;

    const resume = await Resume.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      extractedText,
    });

    res.status(201).json({ resumeId: resume._id, message: 'Resume uploaded successfully' });
  } catch (err) {
    if (err.response && err.response.status === 422) {
      return res.status(422).json({ error: 'Extraction error', message: 'Could not extract text from the uploaded file.' });
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
