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
    // Find actual report in DB
    const report = await AnalysisReport.findById(reportId);
    
    if (!report) {
      return res.status(404).json({ message: 'Analysis report not found.' });
    }

    // Check user authorization
    if (report.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this report.' });
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
