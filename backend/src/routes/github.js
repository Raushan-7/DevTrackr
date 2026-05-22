const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { decrypt } = require('../utils/helpers');
const githubService = require('../services/githubService');
const analyticsService = require('../services/analyticsService');
const Repository = require('../models/Repository');

const router = express.Router();

// Helper to get decrypted token or send unauthorized error
const getDecryptedToken = (user, res) => {
  if (!user.githubToken) {
    res.status(400).json({ message: 'GitHub Personal Access Token not configured. Please go to Settings.' });
    return null;
  }
  try {
    return decrypt(user.githubToken);
  } catch (err) {
    res.status(500).json({ message: 'Failed to decrypt GitHub token.' });
    return null;
  }
};



/**
 * @route   GET /api/github/repos
 * @desc    Fetch user's repositories list
 * @access  Private
 */
router.get('/repos', protect, async (req, res, next) => {
  const token = getDecryptedToken(req.user, res);
  if (!token) return;



  try {
    const repos = await githubService.getRepositoriesList(token);
    return res.json(repos);
  } catch (err) {
    console.error('[GitHub Route] Failed to fetch repos:', err.message);
    return res.status(err.status || 500).json({ 
      message: err.message || 'Failed to retrieve repositories from GitHub.' 
    });
  }
});

/**
 * @route   GET /api/github/repos/:owner/:repo/stats
 * @desc    Fetch and compile repository metrics for dashboard charts
 * @access  Private
 */
router.get('/repos/:owner/:repo/stats', protect, async (req, res, next) => {
  const { owner, repo } = req.params;
  const token = getDecryptedToken(req.user, res);
  if (!token) return;



  try {
    // 1. Compile stats using analyticsService
    const stats = await analyticsService.getRepositoryMetrics(token, owner, repo);

    // 2. Track/Sync this repository in our DB
    await Repository.findOneAndUpdate(
      { owner, repo, userId: req.user._id },
      { lastSynced: new Date() },
      { upsert: true, new: true }
    );

    return res.json(stats);
  } catch (err) {
    console.error(`[GitHub Route] Failed to get stats for ${owner}/${repo}:`, err.message);
    return res.status(err.status || 500).json({ 
      message: err.message || 'Failed to retrieve repository statistics.' 
    });
  }
});

/**
 * @route   GET /api/github/repos/:owner/:repo/contributors
 * @desc    Fetch contributor leaderboard stats
 * @access  Private
 */
router.get('/repos/:owner/:repo/contributors', protect, async (req, res, next) => {
  const { owner, repo } = req.params;
  const token = getDecryptedToken(req.user, res);
  if (!token) return;



  try {
    const rawContributors = await githubService.getContributorsStats(token, owner, repo);
    
    // Map to required schema
    const contributors = rawContributors.map(c => {
      let additions = 0;
      let deletions = 0;

      if (c.weeks && Array.isArray(c.weeks)) {
        c.weeks.forEach(w => {
          additions += w.a || 0;
          deletions += Math.abs(w.d || 0);
        });
      }

      return {
        username: c.author ? c.author.login : 'Unknown',
        avatarUrl: c.author ? c.author.avatar_url : '',
        commits: c.total || 0,
        additions,
        deletions
      };
    });

    return res.json(contributors);
  } catch (err) {
    console.error(`[GitHub Route] Failed to get contributors for ${owner}/${repo}:`, err.message);
    return res.status(err.status || 500).json({ 
      message: err.message || 'Failed to retrieve contributor statistics.' 
    });
  }
});

module.exports = router;
