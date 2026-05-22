# DevTrackr — AI Developer Productivity Dashboard

DevTrackr is an advanced, AI-powered developer productivity dashboard that aggregates data from GitHub repositories, calculates engineering metrics (commits, pull requests, issues, code churn, and contributor contributions), and utilizes Google Gemini models to generate detailed, structured productivity and sprint reports.

This dashboard is designed to provide engineering leads and developers with deep insights into their development velocity, detect code-review bottlenecks, highlight top contributors, and export ready-to-share PDF summaries of sprint performance.

---

## 1. Information & Introduction

### What is DevTrackr?
DevTrackr is a developer productivity platform that bridges the gap between raw git stats and actionable human-centric insights. By linking your GitHub repositories and utilizing Google's Gemini models, it automatically builds metrics graphs and drafts developer summaries that spotlight velocity bottlenecks, team health indexes, and cycle recommendations.

### Key Features
- **Modern Landing Page**: A dark-themed, beautiful, modern SaaS landing page showcasing the dashboard's features, a live feature carousel, pricing benefits, and navigation links.
- **GitHub PAT Integration**: Encrypted Personal Access Token (PAT) integration to securely query commits, pull requests, and issues.
- **Interactive Metric Panels**: Full visual charts representing commits frequency, PR open/merged status distribution, contributor leaderboards, and code churn timelines.
- **AI-Powered Sprint Analysis**: Generates team health gauge scores (0-100), process bottleneck logs, and strategic cycle advice.
- **Gemini Key Fallback**: Transparent credentials validation system enabling users to provide a personal API key if server quotas are exhausted.
- **Branded PDF Export**: Downloadable summaries of generated sprint reports using a custom PDF layout.

---

## 2. Tech Stack

### Frontend
- **React 18** & **Vite**: Single Page Application (SPA) container.
- **Tailwind CSS**: Modern utility styling framework.
- **Recharts**: Responsive charting library built on SVG.
- **React Query (TanStack Query)**: Client-side cache synchronization.
- **Axios**: HTTP requests with dynamic interceptors.

### Backend
- **Node.js** & **Express.js**: Backend API framework.
- **MongoDB** & **Mongoose**: Database and Object Data Modeling (ODM).
- **@google/generative-ai**: Google's official Gemini SDK.
- **pdfkit**: Programmatic PDF document layout builder.
- **octokit**: GitHub API client.

### Security
- **bcryptjs**: Password hashing.
- **jsonwebtoken (JWT)**: User session validation.
- **crypto (AES-256-CBC)**: Industry-standard 256-bit encryption for Personal Access Tokens and Gemini API keys.

---

## 3. How to Setup in Your Local PC

### Prerequisites
- Node.js (v18.x or above)
- npm (v9.x or above)
- MongoDB instance (running locally or a cloud MongoDB Atlas connection URI)

### Step 1: Set Up the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your local configuration file by copying the template:
   ```bash
   cp .env.example .env
   ```
4. Open the `.env` file and populate the environment variables:
   ```env
   # Server Port Configuration
   PORT=5000

   # MongoDB Connection String (Local or MongoDB Atlas)
   MONGODB_URI=mongodb://localhost:27017/devtrackr

   # Secret key for signing JSON Web Tokens
   JWT_SECRET=super_secret_jwt_sign_key_987654

   # Google Gemini API Key
   GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere...

   # 32-byte (64 character hex string) encryption key for GitHub PAT and Gemini API keys
   # To generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   GITHUB_ENCRYPTION_KEY=a7d2b5c4e9f8a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef01234
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will start and begin listening on port `5000`.

### Step 2: Set Up the Frontend
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   Vite will host the frontend UI locally at `http://localhost:5173`. Proxies configured in `vite.config.js` will forward `/api` requests to `http://localhost:5000`.

### Step 3: Seed Database (Optional Demo)
To test the application immediately with mock repository details, run the seed script:
```bash
cd backend
node src/scripts/seed.js
```
This inserts a demo user account (`demo@devtrackr.com` / `password123`) and a pre-cached analysis report, allowing you to log in and explore the app instantly without internet or API keys.

---

## 4. Contributing

We are happy to receive contributions to DevTrackr! Whether you want to fix a bug, add a feature, or improve documentation, your help is welcome.

### How to Contribute

1. **Fork the Repository**: Create a personal copy of the repository on GitHub.
2. **Clone Your Fork**: Download the codebase to your local machine:
   ```bash
   git clone https://github.com/Raushan-7/DevTrackr
   ```
3. **Create a Feature Branch**: Create a branch to work on your changes:
   ```bash
   git checkout -b feature/your-awesome-feature
   ```
4. **Make and Test Your Changes**: Implement your changes and test them locally to ensure everything works correctly.
5. **Commit and Push**:
   ```bash
   git add .
   git commit -m "feat: add details about your awesome changes"
   git push origin feature/your-awesome-feature
   ```
6. **Submit a Pull Request (PR)**: Go to the original DevTrackr repository on GitHub and open a Pull Request from your branch. Provide a clear description of what your PR accomplishes.

Thank you for contributing to DevTrackr! 🚀
