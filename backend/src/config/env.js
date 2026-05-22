const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'GEMINI_API_KEY',
  'GITHUB_ENCRYPTION_KEY'
];

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('\n🔴 Error: Missing required environment variables in .env file:');
  missingEnvVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease check your .env file or environment configuration and try again.\n');
  process.exit(1);
}

module.exports = {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GITHUB_ENCRYPTION_KEY: process.env.GITHUB_ENCRYPTION_KEY,
};
