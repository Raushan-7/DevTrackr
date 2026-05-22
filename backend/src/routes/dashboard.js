const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { decrypt } = require('../utils/helpers');
const Repository = require('../models/Repository');
const analyticsService = require('../services/analyticsService');

const router = express.Router();

/**
 * @route   GET /api/dashboard/summary
 * @desc    Get aggregated metrics across all tracked repositories
 * @access  Private
 */
router.get('/summary', protect, async (req, res, next) => {
  try {
    // 1. Find all repositories tracked by the user
    const trackedRepos = await Repository.find({ userId: req.user._id });

    const responseTemplate = {
      summary: {
        totalCommits: 0,
        openPRs: 0,
        openIssues: 0,
        closedIssues: 0,
        additions: 0,
        deletions: 0
      }
    };

    if (trackedRepos.length === 0) {
      return res.json(responseTemplate);
    }

    // 2. If the user doesn't have a github token, return zeroed aggregate
    if (!req.user.githubToken) {
      return res.json(responseTemplate);
    }

    const token = decrypt(req.user.githubToken);

    // 3. Retrieve stats for all repositories in parallel
    const allRepoStatsPromises = trackedRepos.map(async (repoDoc) => {
      try {
        return await analyticsService.getRepositoryMetrics(token, repoDoc.owner, repoDoc.repo);
      } catch (err) {
        console.warn(`[Dashboard] Failed to fetch stats for ${repoDoc.owner}/${repoDoc.repo}:`, err.message);
        return null;
      }
    });

    const allRepoStats = await Promise.all(allRepoStatsPromises);

    // 4. Aggregate metrics
    const aggregate = {
      totalCommits: 0,
      openPRs: 0,
      openIssues: 0,
      closedIssues: 0,
      additions: 0,
      deletions: 0
    };

    allRepoStats.forEach((stats) => {
      if (stats && stats.summary) {
        aggregate.totalCommits += stats.summary.totalCommits || 0;
        aggregate.openPRs += stats.summary.openPRs || 0;
        aggregate.openIssues += stats.summary.openIssues || 0;
        aggregate.closedIssues += stats.summary.closedIssues || 0;
        aggregate.additions += stats.summary.additions || 0;
        aggregate.deletions += stats.summary.deletions || 0;
      }
    });

    return res.json({
      summary: aggregate
    });

  } catch (err) {
    console.error('[Dashboard Route] Summary aggregation failed:', err.message);
    next(err);
  }
});

module.exports = router;
