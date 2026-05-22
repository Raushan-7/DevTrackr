const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { decrypt } = require('../utils/helpers');
const analyticsService = require('../services/analyticsService');
const aiService = require('../services/aiService');
const AnalysisReport = require('../models/AnalysisReport');

const router = express.Router();

// Helper to get decrypted token or send error
const getDecryptedToken = (user, res) => {
  if (!user.githubToken) {
    res.status(400).json({ message: 'GitHub Personal Access Token not configured.' });
    return null;
  }
  try {
    return decrypt(user.githubToken);
  } catch (err) {
    res.status(500).json({ message: 'Failed to decrypt GitHub token.' });
    return null;
  }
};

// Formatter to support both flat layout (frontend) and nested layout (pdfExport)
const formatReport = (report) => {
  return {
    _id: report._id,
    id: report._id,
    owner: report.owner,
    repo: report.repo,
    createdAt: report.createdAt,
    data: report.data,
    ...report.data // Spread the Gemini JSON fields (sprintSummary, gaugeScore, bottlenecks, priorityBoard, recommendations)
  };
};

/**
 * @route   POST /api/ai/analyze
 * @desc    Generate or return cached AI analysis for a repository
 * @access  Private
 */
router.post('/analyze', protect, async (req, res, next) => {
  const { owner, repo } = req.body;

  if (!owner || !repo) {
    return res.status(400).json({ message: 'Please provide owner and repo.' });
  }

  try {
    // 1. Check if cached report exists in MongoDB
    const cachedReport = await AnalysisReport.findOne({ 
      owner, 
      repo, 
      userId: req.user._id 
    });

    if (cachedReport) {
      console.log(`[AI Route] Returning cached report for ${owner}/${repo}`);
      return res.json(formatReport(cachedReport));
    }

    // 2. Fetch token and fetch recent repository stats
    const token = getDecryptedToken(req.user, res);
    if (!token) return;

    console.log(`[AI Route] Generating new report for ${owner}/${repo}...`);
    const statsData = await analyticsService.getRepositoryMetrics(token, owner, repo);

    // 3. Request Gemini to analyze statistics
    const analysisData = await aiService.generateAnalysisReport(owner, repo, statsData);

    // 4. Save to database (6h TTL auto-deletes this later)
    const newReport = await AnalysisReport.create({
      owner,
      repo,
      userId: req.user._id,
      data: analysisData
    });

    return res.json(formatReport(newReport));
  } catch (err) {
    console.error(`[AI Route] Analysis generation failed:`, err.message);
    return res.status(500).json({ 
      message: err.message || 'Failed to complete AI repository analysis.' 
    });
  }
});

/**
 * @route   POST /api/ai/summarize-commits
 * @desc    Summarize a batch of commit messages
 * @access  Private
 */
router.post('/summarize-commits', protect, async (req, res, next) => {
  const { commits } = req.body;

  if (!commits || !Array.isArray(commits)) {
    return res.status(400).json({ message: 'Please provide a commits array of strings.' });
  }

  try {
    const summary = await aiService.summarizeCommits(commits);
    return res.json(summary);
  } catch (err) {
    console.error('[AI Route] Commit summarization failed:', err.message);
    return res.status(500).json({ 
      message: err.message || 'Failed to summarize commits.' 
    });
  }
});

module.exports = router;
