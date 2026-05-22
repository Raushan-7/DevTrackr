const mongoose = require('mongoose');

const AnalysisReportSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true,
    trim: true,
  },
  repo: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  data: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 21600, // 6 hours TTL index
  },
});

module.exports = mongoose.model('AnalysisReport', AnalysisReportSchema);
