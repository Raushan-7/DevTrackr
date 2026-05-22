const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { encrypt } = require('../utils/helpers');
const githubService = require('../services/githubService');

const router = express.Router();

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Helper to format user response
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  githubUsername: user.githubUsername,
  hasGithubToken: !!user.githubToken,
});

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password, // Pre-save middleware hashes this if it doesn't start with bcrypt prefix
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    return res.json({
      token,
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile details
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  return res.json(formatUser(req.user));
});

/**
 * @route   POST /api/auth/github-token
 * @desc    Submit/update GitHub Personal Access Token (PAT)
 * @access  Private
 */
router.post('/github-token', protect, async (req, res, next) => {
  const { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ message: 'Please provide a GitHub Personal Access Token.' });
    }

    // 1. Verify token validity by calling GitHub API
    let githubProfile;
    try {
      githubProfile = await githubService.getUserProfile(token);
    } catch (err) {
      console.error('[Auth] GitHub token validation failed:', err.message);
      return res.status(400).json({ 
        message: 'Invalid GitHub token. Please verify its scope permissions and validity.' 
      });
    }

    // 2. Encrypt token using aes-256-cbc
    const encryptedToken = encrypt(token);

    // 3. Save to database
    req.user.githubToken = encryptedToken;
    req.user.githubUsername = githubProfile.login;
    await req.user.save();

    return res.json({
      message: 'GitHub Personal Access Token updated and verified successfully.',
      githubUsername: githubProfile.login,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
