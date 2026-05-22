const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  githubToken: {
    type: String, // Encrypted PAT token
    default: null,
  },
  githubUsername: {
    type: String,
    default: null,
  },
  geminiKey: {
    type: String, // Encrypted Gemini API key
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', async function () {
  if (!this.isModified('passwordHash') && !this.isNew) {
    return;
  }
  
  // If passwordHash was set as raw text in signup, hash it now
  if (this.passwordHash && !this.passwordHash.startsWith('$2a$')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    } catch (err) {
      throw err;
    }
  }
});

// Compare password hashes
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
