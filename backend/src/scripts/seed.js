const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Repository = require('../models/Repository');
const AnalysisReport = require('../models/AnalysisReport');

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('🔴 Error: MONGODB_URI is not defined in .env file.');
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    console.log('⏳ Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    const demoEmail = 'demo@devtrackr.com';

    // 1. Clean up existing demo data
    console.log('🧹 Cleaning up existing demo user details...');
    const existingDemoUser = await User.findOne({ email: demoEmail });
    if (existingDemoUser) {
      await Repository.deleteMany({ userId: existingDemoUser._id });
      await AnalysisReport.deleteMany({ userId: existingDemoUser._id });
      await User.deleteOne({ _id: existingDemoUser._id });
      console.log('🗑️ Deleted old demo user data.');
    }

    // 2. Create the demo user
    console.log('👤 Creating demo user account...');
    const demoUser = await User.create({
      name: 'Demo Developer',
      email: demoEmail,
      passwordHash: 'password123', // Mongoose pre-save hook hashes this
      githubToken: 'dummy_token_for_demo', // Intercepted by backend for mock github data
      githubUsername: 'demo-developer',
    });
    console.log(`✅ Created user: ${demoUser.name} (${demoUser.email})`);

    // 3. Create demo tracked repository
    console.log('📁 Tracking demo repository...');
    const repo = await Repository.create({
      owner: 'demo-owner',
      repo: 'demo-repo',
      userId: demoUser._id,
      lastSynced: new Date(),
    });
    console.log(`✅ Tracked repository: ${repo.owner}/${repo.repo}`);

    // 4. Create cached AI sprint analysis report
    console.log('🤖 Creating cached AI sprint analysis report...');
    const report = await AnalysisReport.create({
      owner: 'demo-owner',
      repo: 'demo-repo',
      userId: demoUser._id,
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
      },
      createdAt: new Date(),
    });
    console.log(`✅ Created AI Report with ID: ${report._id}`);

    console.log('\n🎉 Database successfully seeded with demo credentials!');
    console.log('--------------------------------------------------');
    console.log(`📧 Email:    ${demoEmail}`);
    console.log('🔑 Password: password123');
    console.log('--------------------------------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('🔴 Seeding failed with error:', err.message);
    process.exit(1);
  }
};

seedDatabase();
