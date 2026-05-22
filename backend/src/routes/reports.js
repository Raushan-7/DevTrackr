const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const AnalysisReport = require('../models/AnalysisReport');
const generatePDFReport = require('../utils/pdfExport');

const router = express.Router();

/**
 * @route   GET /api/reports/export/:reportId
 * @desc    Generate and stream a styled PDF report for a repository analysis
 * @access  Private (Query token allowed)
 */
router.get('/export/:reportId', protect, async (req, res, next) => {
  const { reportId } = req.params;
  const owner = req.query.owner || 'demo-owner';
  const repo = req.query.repo || 'demo-repo';

  try {
    let report;

    if (reportId === 'demo') {
      // Return a formatted demo report for testing/evaluation
      report = {
        owner,
        repo,
        createdAt: new Date(),
        data: {
          gaugeScore: 88,
          sprintSummary: "The development velocity has remained highly stable during this cycle. Commits show consistent progress across major feature branches. Code churn is well-distributed, indicating high quality checkins and low regression rates. Coordination between team members on critical hotfixes is excellent.",
          bottlenecks: [
            {
              badge: "PR Review Latency",
              description: "Pull requests are sitting open for an average of 3.8 days before receiving reviews, dragging down velocity."
            },
            {
              badge: "High Backlog Creep",
              description: "The rate of incoming issues has exceeded resolved tickets by 15% this week."
            }
          ],
          priorityBoard: [
            {
              task: "Assign dedicated reviewers daily to resolve stale PRs",
              priority: "High"
            },
            {
              task: "Address high-priority backlog tickets on DB indexing issues",
              priority: "High"
            },
            {
              task: "Document newly added API utility modules",
              priority: "Medium"
            }
          ],
          recommendations: [
            "Set a soft limit of 24 hours for review turnarounds on active PRs.",
            "Establish weekly backlog grooming sessions to reprioritize stale feature tickets.",
            "Automate static analysis checks in CI/CD pipeline to offload style reviews."
          ]
        }
      };
    } else {
      // Find actual report in DB
      report = await AnalysisReport.findById(reportId);
      
      if (!report) {
        return res.status(404).json({ message: 'Analysis report not found.' });
      }

      // Check user authorization
      if (report.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this report.' });
      }
    }

    // Set Response headers for streaming PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="devtrackr-report-${report.owner}-${report.repo}.pdf"`
    );

    // Stream PDF generation directly into Response
    generatePDFReport(res, report);

  } catch (err) {
    console.error('[Reports Route] Failed to export PDF:', err.message);
    next(err);
  }
});

module.exports = router;
