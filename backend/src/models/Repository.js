const mongoose = require('mongoose');

const RepositorySchema = new mongoose.Schema({
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
  lastSynced: {
    type: Date,
    default: Date.now,
  },
});

// Avoid duplicate repository tracking per user
RepositorySchema.index({ owner: 1, repo: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Repository', RepositorySchema);
