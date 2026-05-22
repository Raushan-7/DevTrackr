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
  if (user.githubToken.startsWith('dummy_')) {
    return user.githubToken;
  }
  try {
    return decrypt(user.githubToken);
  } catch (err) {
    res.status(500).json({ message: 'Failed to decrypt GitHub token.' });
    return null;
  }
};

// Mock structures for Demo Mode
const MOCK_REPOS = [
  {
    id: 999999,
    name: 'demo-repo',
    owner: 'demo-owner',
    private: false,
    description: 'A mock repository containing developer productivity metrics for demonstration purposes.',
    htmlUrl: 'https://github.com/demo-owner/demo-repo'
  }
];

const MOCK_STATS = {
  summary: {
    totalCommits: 142,
    openPRs: 5,
    openIssues: 12,
    closedIssues: 38,
    additions: 12450,
    deletions: 4890
  },
  charts: {
    commitActivity: [
      { date: '2026-05-09', commits: 5 },
      { date: '2026-05-10', commits: 8 },
      { date: '2026-05-11', commits: 12 },
      { date: '2026-05-12', commits: 15 },
      { date: '2026-05-13', commits: 7 },
      { date: '2026-05-14', commits: 3 },
      { date: '2026-05-15', commits: 6 },
      { date: '2026-05-16', commits: 9 },
      { date: '2026-05-17', commits: 14 },
      { date: '2026-05-18', commits: 18 },
      { date: '2026-05-19', commits: 22 },
      { date: '2026-05-20', commits: 11 },
      { date: '2026-05-21', commits: 8 },
      { date: '2026-05-22', commits: 4 }
    ],
    prStatus: {
      open: 5,
      closed: 3,
      merged: 24
    },
    codeChurn: [
      { date: '2026-03-01', additions: 1200, deletions: 300 },
      { date: '2026-03-15', additions: 1800, deletions: 600 },
      { date: '2026-04-01', additions: 2200, deletions: 1200 },
      { date: '2026-04-15', additions: 1500, deletions: 800 },
      { date: '2026-05-01', additions: 3200, deletions: 1100 },
      { date: '2026-05-15', additions: 2550, deletions: 890 }
    ],
    issuesTrend: [
      { date: '2026-05-09', open: 8, closed: 30 },
      { date: '2026-05-10', open: 9, closed: 31 },
      { date: '2026-05-11', open: 11, closed: 32 },
      { date: '2026-05-12', open: 10, closed: 34 },
      { date: '2026-05-13', open: 12, closed: 34 },
      { date: '2026-05-14', open: 11, closed: 35 },
      { date: '2026-05-15', open: 13, closed: 36 },
      { date: '2026-05-16', open: 14, closed: 36 },
      { date: '2026-05-17', open: 12, closed: 37 },
      { date: '2026-05-18', open: 11, closed: 38 },
      { date: '2026-05-19', open: 10, closed: 39 },
      { date: '2026-05-20', open: 13, closed: 39 },
      { date: '2026-05-21', open: 12, closed: 40 },
      { date: '2026-05-22', open: 12, closed: 40 }
    ]
  },
  contributors: [
    { username: 'demo-developer', avatarUrl: 'https://github.com/identicons/demo-developer.png', commits: 54, additions: 4500, deletions: 1800 },
    { username: 'alice-coder', avatarUrl: 'https://github.com/identicons/alice-coder.png', commits: 38, additions: 3800, deletions: 1200 },
    { username: 'bob-reviewer', avatarUrl: 'https://github.com/identicons/bob-reviewer.png', commits: 25, additions: 2100, deletions: 900 },
    { username: 'charlie-tester', avatarUrl: 'https://github.com/identicons/charlie-tester.png', commits: 15, additions: 1250, deletions: 500 },
    { username: 'david-doc', avatarUrl: 'https://github.com/identicons/david-doc.png', commits: 10, additions: 800, deletions: 490 }
  ]
};

/**
 * @route   GET /api/github/repos
 * @desc    Fetch user's repositories list
 * @access  Private
 */
router.get('/repos', protect, async (req, res, next) => {
  const token = getDecryptedToken(req.user, res);
  if (!token) return;

  if (token.startsWith('dummy_')) {
    return res.json(MOCK_REPOS);
  }

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

  if (token.startsWith('dummy_') || (owner === 'demo-owner' && repo === 'demo-repo')) {
    // Register repo in DB
    await Repository.findOneAndUpdate(
      { owner: 'demo-owner', repo: 'demo-repo', userId: req.user._id },
      { lastSynced: new Date() },
      { upsert: true, new: true }
    );
    return res.json(MOCK_STATS);
  }

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

  if (token.startsWith('dummy_') || (owner === 'demo-owner' && repo === 'demo-repo')) {
    return res.json(MOCK_STATS.contributors);
  }

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
