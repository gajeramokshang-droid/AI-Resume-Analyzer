const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  overallScore: { type: Number, default: 0 },
  atsScore: { type: Number, default: 0 },
  jobMatchScore: { type: Number, default: 0 },
  matchingSkills: [String],
  missingSkills: [String],
  keywords: [String],
  strengths: [String],
  weaknesses: [String],
  recommendations: [String],
  recommendedRoles: [
    {
      role: String,
      match: Number
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analysis', analysisSchema);
