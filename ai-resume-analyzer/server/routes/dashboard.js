const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');

// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalResumes = await Resume.countDocuments({ userId });
    const analyses = await Analysis.find({ userId }).sort({ createdAt: -1 });

    const totalAnalyses = analyses.length;
    const avgScore = totalAnalyses
      ? Math.round(analyses.reduce((sum, a) => sum + a.overallScore, 0) / totalAnalyses)
      : 0;
    const highestScore = totalAnalyses
      ? Math.max(...analyses.map((a) => a.overallScore))
      : 0;

    const recentAnalyses = analyses.slice(0, 5).map((a) => ({
      _id: a._id,
      jobTitle: a.jobTitle,
      overallScore: a.overallScore,
      atsScore: a.atsScore,
      jobMatchScore: a.jobMatchScore,
      createdAt: a.createdAt,
    }));

    const scoreHistory = analyses.map((a) => ({
      score: a.overallScore,
      date: a.createdAt,
    })).reverse();

    res.json({ totalResumes, totalAnalyses, avgScore, highestScore, recentAnalyses, scoreHistory });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: 'Internal server error' });
  }
});

module.exports = router;
