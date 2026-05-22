# DevTrackr - AI Developer Productivity Dashboard Implementation Plan

This document outlines the architecture, database models, API design, frontend pages, and step-by-step plan for building DevTrackr.

## User Review Required

> [!IMPORTANT]
> **Gemini Model Choice**: We will use `gemini-1.5-flash` or `gemini-2.5-flash` via the `@google/generative-ai` SDK. Gemini models support structured JSON outputs natively, which makes it perfect for generating our sprint reports.
>
> **Encryption Key**: We will use a standard 32-byte hexadecimal key for `GITHUB_ENCRYPTION_KEY` to encrypt GitHub Personal Access Tokens (PATs) using `aes-256-cbc`.
>
> **GitHub Auth / PAT Flow**: Since OAuth is more complex for local setups without a registered app, we will use a **Personal Access Token (PAT)** settings form as requested. The user must provide a PAT with `repo` and `read:user` permissions.

## Proposed Changes

We will create a root folder named `devtrackr` containing two sub-folders: `backend` and `frontend`.

---

### Backend Components

#### [NEW] [db.js](file:///E:/Dev%20Tracker/devtrackr/backend/src/config/db.js)
Sets up Mongoose to connect to MongoDB.

#### [NEW] [env.js](file:///E:/Dev%20Tracker/devtrackr/backend/src/config/env.js)
Validates that all required environment variables (`MONGODB_URI`, `JWT_SECRET`, `ANTHROPIC_API_KEY`, `GITHUB_ENCRYPTION_KEY`, `PORT`) are present.

#### [NEW] [User.js](file:///E:/Dev%20Tracker/devtrackr/backend/src/models/User.js)
Mongoose model for users:
- `name` (String, required)
- `email` (String, required, unique)
- `passwordHash` (String, required)
- `githubToken` (String, encrypted, optional)
- `githubUsername` (String, optional)
- `createdAt` (Date, default Date.now)

#### [NEW] [Repository.js](file:///E:/Dev%20Tracker/devtrackr/backend/src/models/Repository.js)
Mongoose model for tracked repositories:
- `owner` (String, required)
- `repo` (String, required)
- `userId` (ObjectId ref User, required)
- `lastSynced` (Date, default Date.now)

#### [NEW] [AnalysisReport.js](file:///E:/Dev%20Tracker/devtrackr/backend/src/models/AnalysisReport.js)
Mongoose model for AI analysis reports with a 6-hour TTL:
- `owner` (String, required)
- `repo` (String, required)
- `userId` (ObjectId ref User, required)
- `data` (Object, representing the JSON response from Claude)
- `createdAt` (Date, default Date.now, expires '6h')

#### [NEW] [authMiddleware.js](file:///E:/Dev%20Tracker/devtrackr/backend/src/middleware/authMiddleware.js)
Verifies the JWT token from the `Authorization: Bearer <token>` header, decodes it, and attaches the User object to `req.user`.

#### [NEW] [errorHandler.js](file:///E:/Dev%20Tracker/devtrackr/backend/src/middleware/errorHandler.js)
Global Express error handling middleware that returns JSON-formatted error responses.

#### [NEW] [helpers.js](file:///E:/Dev%20Tracker/devtrackr/backend/src/utils/helpers.js)
Contains crypto helpers for encrypting and decrypting the GitHub PAT (`aes-256-cbc`) using `GITHUB_ENCRYPTION_KEY`.

#### [NEW] [pdfExport.js](file:///E:/Dev%20Tracker/devtrackr/backend/src/utils/pdfExport.js)
Uses `pdfkit` to generate a styled developer productivity PDF report.

#### [NEW] [githubService.js](file:///E:/Dev%20Tracker/devtrackr/backend/src/services/githubService.js)
Encapsulates all Octokit REST calls. Uses exponential backoff for retrying if rate limits (429) are encountered.
Fetches:
- Repositories list
- Repository stats (commits last 90 days, PR counts, issues counts, contributors, code frequency)
- Contributor details

#### [NEW] [aiService.js](file:///E:/Dev%20Tracker/devtrackr/backend/src/services/aiService.js)
Handles interaction with the Anthropic Claude API. Generates structured JSON output for repo analysis and summaries of commit batches.

#### [NEW] [analyticsService.js](file:///E:/Dev%20Tracker/devtrackr/backend/src/services/analyticsService.js)
Integrates and formats data from githubService to feed the frontend charts and metrics.

#### [NEW] [auth.js controller & routes](file:///E:/Dev%20Tracker/devtrackr/backend/src/controllers/auth.js) / [auth.js route](file:///E:/Dev%20Tracker/devtrackr/backend/src/routes/auth.js)
Endpoints:
- `POST /api/auth/signup` (Validate, hash password, create user)
- `POST /api/auth/login` (Validate credentials, generate JWT)
- `GET /api/auth/me` (Fetch current user details)
- `POST /api/auth/github-token` (Update and encrypt GitHub PAT)

#### [NEW] [github.js controller & routes](file:///E:/Dev%20Tracker/devtrackr/backend/src/controllers/github.js) / [github.js route](file:///E:/Dev%20Tracker/devtrackr/backend/src/routes/github.js)
Endpoints:
- `GET /api/github/repos` (Fetch user's GitHub repos using their PAT)
- `GET /api/github/repos/:owner/:repo/stats` (Fetch commits, PRs, issues, code frequency, contributors)
- `GET /api/github/repos/:owner/:repo/contributors` (Fetch per-contributor stats)

#### [NEW] [ai.js controller & routes](file:///E:/Dev%20Tracker/devtrackr/backend/src/controllers/ai.js) / [ai.js route](file:///E:/Dev%20Tracker/devtrackr/backend/src/routes/ai.js)
Endpoints:
- `POST /api/ai/analyze` (Run or return cached AI analysis)
- `POST /api/ai/summarize-commits` (Generate changelog from a batch of commit messages)

#### [NEW] [dashboard.js controller & routes](file:///E:/Dev%20Tracker/devtrackr/backend/src/controllers/dashboard.js) / [dashboard.js route](file:///E:/Dev%20Tracker/devtrackr/backend/src/routes/dashboard.js)
Endpoints:
- `GET /api/dashboard/summary` (Retrieve aggregate counts and historical data for charts)

#### [NEW] [reports.js controller & routes](file:///E:/Dev%20Tracker/devtrackr/backend/src/controllers/reports.js) / [reports.js route](file:///E:/Dev%20Tracker/devtrackr/backend/src/routes/reports.js)
Endpoints:
- `GET /api/reports/export/:reportId` (Generate and download a PDF report containing chart data tables, AI analysis summary, and recommendations)

#### [NEW] [server.js](file:///E:/Dev%20Tracker/devtrackr/backend/server.js)
Main application entry point. Sets up express, middleware, mounts routes, and starts listening on `PORT`.

---

### Frontend Components

#### [NEW] [vite.config.js](file:///E:/Dev%20Tracker/devtrackr/frontend/vite.config.js)
Vite configuration with Tailwind CSS integration and dev server proxy settings.

#### [NEW] [api.js](file:///E:/Dev%20Tracker/devtrackr/frontend/src/services/api.js)
Centralized Axios instance with a request interceptor to append the JWT `Authorization: Bearer <token>` header dynamically.

#### [NEW] [AuthContext.jsx](file:///E:/Dev%20Tracker/devtrackr/frontend/src/context/AuthContext.jsx) & [useAuth.js](file:///E:/Dev%20Tracker/devtrackr/frontend/src/hooks/useAuth.js)
Manages user authentication state, signup/login operations, token storage in localStorage, and authentication persistence.

#### [NEW] [useGitHub.js](file:///E:/Dev%20Tracker/devtrackr/frontend/src/hooks/useGitHub.js)
React Query hooks for querying repo listings, statistics, and contributor information.

#### [NEW] [useAI.js](file:///E:/Dev%20Tracker/devtrackr/frontend/src/hooks/useAI.js)
React Query hooks for requesting repository AI analysis and commit summary/changelogs.

#### [NEW] [App.jsx](file:///E:/Dev%20Tracker/devtrackr/frontend/src/App.jsx)
Sets up routes, React Query client provider, and AuthContext. Implements layout routing.

#### [NEW] [Components (Navbar, Sidebar, Charts, Cards)](file:///E:/Dev%20Tracker/devtrackr/frontend/src/components/)
- **Navbar**: App logo, user profile summary, dark mode toggle.
- **Sidebar**: Links for Dashboard, Repositories, AI Insights, Settings.
- **Charts**:
  - `CommitActivityChart`: Responsive BarChart for daily commits.
  - `PRStatusChart`: Responsive PieChart of PR status breakdown.
  - `ContributorLeaderboard`: Responsive horizontal BarChart of top contributors.
  - `IssuesTrendChart`: Responsive LineChart comparing open/closed issues.
  - `CodeChurnChart`: Responsive AreaChart displaying additions/deletions.
- **Cards**: Reusable UI cards for metrics, alerts, severity levels, and priority items.

#### [NEW] [Pages](file:///E:/Dev%20Tracker/devtrackr/frontend/src/pages/)
- **Login**: Elegant login page.
- **Signup**: Signup page with client-side validation.
- **Dashboard**: Repo selector, core metrics widgets (total commits, PRs, issues, churn), and the 5 charts.
- **Repos**: Displays list of repos from the user's GitHub with quick-analyze triggers.
- **AIInsights**: Detailed visualization of Claude's report (sprint summary, gauge score, bottleneck badges, priority board, recommendations, and PDF Export trigger).
- **Settings**: Setting form to update user profile and submit/save their GitHub PAT.

---

### Additional Deliverables

#### [NEW] [seed.js](file:///E:/Dev%20Tracker/devtrackr/scripts/seed.js)
Creates a mock user (`demo@devtrackr.com` / `password123`) and seeds a mock repository + analysis report in MongoDB for testing out-of-the-box functionality without an active internet connection or key.

#### [NEW] [docker-compose.yml](file:///E:/Dev%20Tracker/devtrackr/docker-compose.yml)
Orchestrates MongoDB, backend (Express), and frontend (Vite) for immediate local environment setup.

#### [NEW] [README.md](file:///E:/Dev%20Tracker/devtrackr/README.md)
Detailed setup instructions, explanation of environmental configuration, and comprehensive API routing documentation.

---

## Verification Plan

### Automated Verification
- We will verify that each API response has validation.
- We will verify database connection, JWT token issuance, and password hashing via manual curl/postman calls or writing a scratch test script.
- We will verify front-end compilation and routing using Vite's build tools.

### Manual Verification
- Launch the application locally.
- Test user registration and login.
- Test adding a mock/real PAT, fetching repositories, generating analysis reports, and rendering all Recharts.
- Verify download of the export PDF from the front-end.
- Ensure light/dark mode toggles modify the HTML classes appropriately and update stored states.
