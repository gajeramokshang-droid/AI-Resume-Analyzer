const express=require('express');
const router=express.Router();
const axios=require('axios');
const auth=require('../middleware/auth');
const Resume=require('../models/Resume');
const Analysis=require('../models/Analysis');

router.post('/',auth,async(req,res)=>{
    const {resumeId,jobTitle,jobDescription}=req.body;
    if(!jobDescription||jobDescription.length<50){
            return res.status(400).json({ error: 'Validation error', message: 'Job description must be at least 50 characters.' });
    }
    try{
        const resume=await Resume.findById(resumeId);
        if(!resume||resume.userId.toString()!==req.user.id){
             return res.status(403).json({ error: 'Forbidden', message: 'Access denied to this resume' });
        }
         const analyzerRes = await axios.post(
      `${process.env.ANALYZER_URL}/analyze`,
      {
        extracted_text: resume.extractedText,
        job_title: jobTitle,
        job_description: jobDescription,
      },
      { timeout: 30000 }
    );
     const result = analyzerRes.data;
      const analysis = await Analysis.create({
      userId: req.user.id,
      resumeId,
      jobTitle,
      jobDescription,
      overallScore: result.overallScore,
      atsScore: result.atsScore,
      jobMatchScore: result.jobMatchScore,
      matchingSkills: result.matchingSkills,
      missingSkills: result.missingSkills,
      keywords: result.keywords,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      recommendations: result.recommendations,
      recommendedRoles: result.recommendedRoles,
    });
    res.status(201).json(analysis)
    }
    catch(err){
         if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      return res.status(502).json({ error: 'Service unavailable', message: 'Analysis service unavailable. Please try again.' });
    }
        res.status(500).json({ error: 'Server error', message: 'Internal server error' });

    }
});

// GET /api/analyses
router.get('/', auth, async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user.id })
      .select('_id jobTitle overallScore atsScore jobMatchScore createdAt')
      .sort({ createdAt: -1 });
    res.json(analyses);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: 'Internal server error' });
  }
});

// GET /api/analyses/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Not found', message: 'Analysis not found' });
    }
    if (analysis.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    }
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: 'Internal server error' });
  }
});

module.exports = router;

