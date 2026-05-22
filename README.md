# DevTrackr - AI Developer Productivity Dashboard

DevTrackr is an advanced, AI-powered developer productivity dashboard that aggregates data from GitHub repositories, calculates engineering metrics (commits, pull requests, issues, code churn, and contributor contributions), and utilizes Gemini models to generate detailed, structured productivity and sprint reports.

This dashboard is designed to provide engineering leads and developers with deep insights into their development velocity, detect code-review bottlenecks, highlight top contributors, and export ready-to-share PDF summaries of sprint performance.

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Directory Structure](#directory-structure)
- [Tech Stack](#tech-stack)
- [Database Schemas](#database-schemas)
- [API Documentation](#api-documentation)
- [GitHub Token Encryption (AES-256-CBC)](#github-token-encryption-aes-256-cbc)
- [Gemini Structured AI Reports](#gemini-structured-ai-reports)
- [Environment Configuration](#environment-configuration)
- [Local Installation & Setup](#local-installation--setup)
- [Seeding & Out-of-the-Box Demo](#seeding--out-of-the-box-demo)
- [Docker Compose Deployment](#docker-compose-deployment)
- [Frontend Pages & UI Components](#frontend-pages--ui-components)
- [Verification Plan](#verification-plan)

---

## System Architecture

The following diagram illustrates the data flow and communication protocols within DevTrackr:

```mermaid
graph TD
    User([User / Web Browser]) <-->|HTTPS / React, Recharts| Frontend[Frontend: Vite + React]
    Frontend <-->|JWT Auth & REST API| Backend[Backend: Express.js]
    Backend <-->|Mongoose| MongoDB[(MongoDB Atlas / Local)]
    Backend -->|Octokit REST API / Bearer Token| GitHubAPI[GitHub REST API]
    Backend -->|@google/generative-ai SDK| GeminiAPI[Google Gemini API]
    Backend -->|pdfkit| PDFGenerator[PDF Export Engine]
```

---

## Directory Structure

DevTrackr is organized into a mono-repo structure with separate `backend` and `frontend` folders at the root:

```text
.
├── docker-compose.yml              # Multi-container local orchestration
├── README.md                       # Comprehensive guide (this file)
├── backend/
│   ├── package.json
│   ├── server.js                   # Express application entrypoint
│   └── src/
│       ├── config/
│       │   ├── db.js               # MongoDB Mongoose connection handler
│       │   └── env.js              # Environment variable assertion & loading
│       ├── middleware/
│       │   ├── authMiddleware.js   # JWT authentication validation
│       │   └── errorHandler.js     # Unified JSON error handler
│       ├── models/
│       │   ├── User.js             # User data & credentials schema
│       │   ├── Repository.js       # Tracked repository linkages
│       │   └── AnalysisReport.js   # Cached AI reports (6h TTL)
│       ├── routes/
│       │   ├── auth.js             # Signup, login, PAT setting
│       │   ├── github.js           # Repo sync, stats, and contributors
│       │   ├── ai.js               # Report generation & commit summaries
│       │   ├── dashboard.js        # Aggregated stats for metrics cards
│       │   └── reports.js          # PDF generation & downloads
│       ├── services/
│       │   ├── githubService.js    # Octokit-based queries with rate limit handling
│       │   ├── aiService.js        # Gemini SDK structured JSON prompt handlers
│       │   └── analyticsService.js # Formatting raw data for Recharts UI
│       └── utils/
│           ├── helpers.js          # AES-256-CBC encryption/decryption utilities
│           └── pdfExport.js        # PDF generation with custom layout & branding
├── frontend/
│   ├── package.json
│   ├── vite.config.js              # Vite configuration & proxy settings
│   ├── index.html
│   └── src/
│       ├── App.jsx                 # Routes & layout wrapper
│       ├── main.jsx
│       ├── index.css               # Core Tailwind directives & custom CSS variables
│       ├── context/
│       │   └── AuthContext.jsx     # Global authentication provider
│       ├── hooks/
│       │   ├── useAuth.js          # Context hook for authentication
│       │   ├── useGitHub.js        # React Query hooks for fetching repos & stats
│       │   └── useAI.js            # React Query hooks for AI actions
│       ├── services/
│       │   └── api.js              # Axios configuration with JWT interceptors
│       ├── components/
│       │   ├── Navbar.jsx          # Header with user card & dark/light toggles
│       │   ├── Sidebar.jsx         # App navigation links
│       │   ├── Card.jsx            # Reusable KPIs cards
│       │   └── charts/
│       │       ├── CommitActivityChart.jsx   # Commits timeline chart (Bar)
│       │       ├── PRStatusChart.jsx         # PR distribution chart (Pie)
│       │       ├── ContributorLeaderboard.jsx# Top contributors (Horizontal Bar)
│       │       ├── IssuesTrendChart.jsx      # Issues comparison (Line)
│       │       └── CodeChurnChart.jsx        # Code insertions/deletions (Area)
│       └── pages/
│           ├── Login.jsx           # Clean authentication input page
│           ├── Signup.jsx          # Simple sign-up form with validations
│           ├── Dashboard.jsx       # Aggregated KPIs and the 5 charts
│           ├── Repos.jsx           # Tracked repositories management & sync triggers
│           ├── AIInsights.jsx      # Interactive sprint summary & bottleneck indicators
│           └── Settings.jsx        # User profile, theme settings, and GitHub PAT token form
└── scripts/
    └── seed.js                     # Script to insert sample data for demo runs
```

---

## Tech Stack

### Backend
- **Node.js** & **Express.js**: Fast, unopinionated web framework.
- **MongoDB** & **Mongoose**: NoSQL document storage and Object Data Modeling (ODM).
- **@google/generative-ai**: Google's official Gemini SDK to prompt Gemini models with strict JSON schema structures.
- **jsonwebtoken (JWT)** & **bcryptjs**: Secure user authentication and password hashing.
- **pdfkit**: Programmatic generation of high-quality PDFs containing vectors, layouts, and tables.
- **octokit**: GitHub API client for Node.js.

### Frontend
- **React 18** (Vite-powered): Speedy development and optimized production bundles.
- **Tailwind CSS**: Rapid styling utilizing utility classes.
- **Recharts**: Composited charting library built on SVG for responsive rendering of data grids.
- **React Query (TanStack Query)**: Client-side cache synchronization and async queries.
- **Axios**: Promised-based HTTP requests with dynamic interceptor attachments.

---

## Database Schemas

DevTrackr stores details about users, registered credentials, linked repositories, and cached AI productivity analyses.

### 1. User Schema (`User.js`)
Stores user profiles and encrypted access tokens for GitHub interactions.

```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  githubToken: { type: String }, // Encrypted with AES-256-CBC
  githubUsername: { type: String },
  createdAt: { type: Date, default: Date.now }
}
```

### 2. Repository Schema (`Repository.js`)
Tracks the repositories explicitly selected for analysis by each user.

```javascript
{
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  lastSynced: { type: Date, default: Date.now }
}
```

### 3. Analysis Report Schema (`AnalysisReport.js`)
Caches AI-generated report payloads to avoid redundant prompts to Gemini and stay within API usage parameters. Uses a 6-hour TTL expiration.

```javascript
{
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  data: { type: Object, required: true }, // The JSON schema returned from Gemini
  createdAt: { type: Date, default: Date.now, expires: '6h' } // Automatically deleted after 6h
}
```

---

## API Documentation

All routes expect the HTTP header `Authorization: Bearer <JWT_TOKEN>` unless they are marked public.

### Authentication Routes (`/api/auth`)

#### `POST /api/auth/signup` (Public)
Creates a new account.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "strongpassword123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "603d...",
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```

#### `POST /api/auth/login` (Public)
Logs in an existing user and returns a token.
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "strongpassword123"
  }
  ```
- **Response (200 OK)**: Same structure as signup.

#### `GET /api/auth/me`
Retrieves details of the currently authenticated user session.
- **Response (200 OK)**:
  ```json
  {
    "id": "603d...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "githubUsername": "janedoe-dev",
    "hasGithubToken": true
  }
  ```

#### `POST /api/auth/github-token`
Saves or updates the user's GitHub Personal Access Token (PAT).
- **Request Body**:
  ```json
  {
    "token": "ghp_yourTokenHere12345"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "GitHub Personal Access Token updated successfully.",
    "githubUsername": "janedoe-dev"
  }
  ```

---

### GitHub Service Routes (`/api/github`)

#### `GET /api/github/repos`
Fetches a user's accessible remote GitHub repositories using their encrypted PAT.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 1234567,
      "name": "project-tracker",
      "owner": "janedoe-dev",
      "private": false,
      "description": "Dev tracking app"
    }
  ]
  ```

#### `GET /api/github/repos/:owner/:repo/stats`
Fetches combined repository metrics (commits, PRs, issues, additions/deletions) aggregated over the last 90 days.
- **Response (200 OK)**:
  ```json
  {
    "summary": {
      "totalCommits": 142,
      "openPRs": 4,
      "closedPRs": 12,
      "openIssues": 8,
      "closedIssues": 24,
      "additions": 8420,
      "deletions": 3120
    },
    "charts": {
      "commitActivity": [
        { "date": "2026-05-15", "commits": 12 }
      ],
      "codeChurn": [
        { "date": "2026-05-15", "additions": 450, "deletions": 120 }
      ],
      "prStatus": {
        "open": 4,
        "closed": 12,
        "merged": 8
      },
      "issuesTrend": [
        { "date": "2026-05-15", "open": 8, "closed": 24 }
      ]
    }
  }
  ```

#### `GET /api/github/repos/:owner/:repo/contributors`
Fetches the contribution activity (commits, pull requests, files modified) of top repository committers.
- **Response (200 OK)**:
  ```json
  [
    {
      "username": "janedoe-dev",
      "avatarUrl": "https://...",
      "commits": 84,
      "additions": 6200,
      "deletions": 2000
    }
  ]
  ```

---

### AI Service Routes (`/api/ai`)

#### `POST /api/ai/analyze`
Submits aggregated repository statistics to the Gemini model to compile a comprehensive developer productivity analysis. Uses caching inside `AnalysisReport` for requests within 6 hours.
- **Request Body**:
  ```json
  {
    "owner": "janedoe-dev",
    "repo": "project-tracker"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "sprintSummary": "This sprint focused on refactoring authentication routines...",
    "gaugeScore": 84,
    "bottlenecks": [
      {
        "badge": "Review Bottleneck",
        "description": "Average PR review latency is exceeding 72 hours due to thin review allocation."
      }
    ],
    "priorityBoard": [
      {
        "task": "Distribute PR review duties evenly",
        "priority": "High"
      }
    ],
    "recommendations": [
      "Incorporate GitHub action automations for simple format reviews to speed up merges."
    ]
  }
  ```

#### `POST /api/ai/summarize-commits`
Summarizes a list of recent commit messages into a clean, human-readable changelog release note.
- **Request Body**:
  ```json
  {
    "commits": [
      "fix: patch security bug in route middleware validation",
      "feat: add code churn area chart visualization",
      "docs: update setup commands"
    ]
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "changelog": "- **Security**: Resolved a vulnerability within the route validation handler.\n- **Dashboard**: Added a new Area Chart showing historical code additions/deletions.\n- **Documentation**: Simplified onboarding steps in README."
  }
  ```

---

### Dashboard Routes (`/api/dashboard`)

#### `GET /api/dashboard/summary`
Calculates aggregated statistics across all tracked repositories for the current user.
- **Response (200 OK)**:
  ```json
  {
    "trackedReposCount": 3,
    "totalCommits": 432,
    "totalPRs": 42,
    "activeContributorsCount": 6,
    "globalCommitActivity": [
      { "date": "2026-05-15", "commits": 24 }
    ]
  }
  ```

---

### Report Export Routes (`/api/reports`)

#### `GET /api/reports/export/:reportId`
Builds a customized PDF version of an AI Analysis Report using `pdfkit`. The document returns with binary content-type `application/pdf`.
- **Response (200 OK)**: Binary Stream (`DevTrackr_Report_<ID>.pdf`)

---

## GitHub Token Encryption (AES-256-CBC)

To securely store personal access tokens locally, the backend encrypts PATs before storing them in MongoDB. When needed, the token is decrypted dynamically in memory to complete API calls.

- **Algorithm**: `aes-256-cbc`
- **Key**: Configured via the `GITHUB_ENCRYPTION_KEY` environment variable. Must be a 32-byte (64 characters) hexadecimal string.
- **IV Management**: A new, cryptographically strong random Initialization Vector (IV) is generated via `crypto.randomBytes(16)` for each encryption operation. The IV is concatenated with the encrypted ciphertext (e.g., `iv.toString('hex') + ':' + encrypted.toString('hex')`) and saved in the database.
- **Decryption**: The ciphertext is split back into the IV and encrypted text, then decrypted using the master key.

---

## Gemini Structured AI Reports

DevTrackr prompts the Gemini model using the `@google/generative-ai` SDK. Structured schema validation is enforced natively to guarantee a strict JSON output matching our database models and frontend expectations.

### Gemini API Call Schema Definition
```javascript
const { GoogleGenAI } = require("@google/generative-ai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generationConfig = {
  responseMimeType: "application/json",
  responseSchema: {
    type: "OBJECT",
    properties: {
      sprintSummary: { type: "STRING" },
      gaugeScore: { type: "INTEGER" },
      bottlenecks: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            badge: { type: "STRING" },
            description: { type: "STRING" }
          },
          required: ["badge", "description"]
        }
      },
      priorityBoard: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            task: { type: "STRING" },
            priority: { type: "STRING" }
          },
          required: ["task", "priority"]
        }
      },
      recommendations: {
        type: "ARRAY",
        items: { type: "STRING" }
      }
    },
    required: ["sprintSummary", "gaugeScore", "bottlenecks", "priorityBoard", "recommendations"]
  }
};
```

---

## Environment Configuration

Create a `.env` file in the `backend/` directory based on the following template:

```env
# Server Port Configuration
PORT=5000

# MongoDB Connection String (Local or MongoDB Atlas)
MONGODB_URI=mongodb://localhost:27017/devtrackr

# Secret key for signing JSON Web Tokens
JWT_SECRET=super_secret_jwt_sign_key_987654

# Google Gemini API Key
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere...

# 32-byte (64 character hex string) encryption key for GitHub PAT tokens
# To generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
GITHUB_ENCRYPTION_KEY=a7d2b5c4e9f8a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef01234
```

---

## Local Installation & Setup

Follow these commands to install and start the application locally.

### Prerequisites
- Node.js (v18.x or above)
- npm (v9.x or above)
- MongoDB instance (running locally or a cloud Atlas connection URI)

### 1. Clone & Set Up the Backend
```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Setup your Environment variables
cp .env.example .env  # Or create .env manually and populate it

# Start the Backend server (Development mode)
npm run dev
```
The server will boot and begin listening on port `5000`.

### 2. Set Up the Frontend
```bash
# Open a new terminal and navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start Vite Dev Server
npm run dev
```
Vite will host the frontend UI locally at `http://localhost:5173`. Proxies configured in `vite.config.js` will transparently forward `/api` requests to `http://localhost:5000`.

---

## Seeding & Out-of-the-Box Demo

To allow immediate testing without providing any API keys or internet connection, we provide a database seed script.

This creates:
- A demo user account: `demo@devtrackr.com` with password `password123`.
- A pre-configured repository link: `janedoe-dev/project-tracker`.
- A pre-rendered Analysis Report cached in the database so the AI insights page works instantly.

### Running the Seed Script
```bash
cd backend
node src/scripts/seed.js
```
Now, navigate to the Login page on the frontend, input `demo@devtrackr.com` / `password123`, and explore the dashboard metrics and AI insights tables.

---

## Docker Compose Deployment

If you have Docker and Docker Compose installed, you can spin up the entire container stack (MongoDB, Backend, and Frontend) with a single command.

Make sure you configure the `.env` variables inside `backend/.env` beforehand.

```bash
# Start all containers in the background
docker-compose up -d

# View log outputs
docker-compose logs -f
```

The services will map as follows:
- **MongoDB**: Internal container access
- **Backend API**: `http://localhost:5000`
- **Frontend Dashboard UI**: `http://localhost:5173`

---

## Frontend Pages & UI Components

The frontend interface incorporates professional visuals, glassmorphism card highlights, a complete dark/light theme, and transitions.

### Key Pages
1. **Login & Signup (`/login`, `/signup`)**: Minimalist layouts with robust validation patterns and clear error alerts.
2. **Dashboard (`/`)**: Main panel loaded with metric cards (Commits, Open Issues, Pull Request Velocity, Code Churn) and interactive Recharts graphs. Includes an owner/repo drop-down selector.
3. **Repository Manager (`/repos`)**: Allows users to import, sync, or trigger analysis runs on their repositories.
4. **AI Insights (`/insights`)**: Renders Gemini's productivity breakdown, showcasing a progress gauge indicator for team health, color-coded bottleneck indicators, actionable items on a priority board, and custom summary write-ups. Contains a **PDF Export** button.
5. **Settings (`/settings`)**: Updates name/email and saves the encrypted GitHub PAT.

### Interactive Recharts Included
- `CommitActivityChart`: Dynamic Bar chart representing the frequency of daily/weekly changes.
- `PRStatusChart`: Circular Pie chart visually separating active, completed, and rejected code submissions.
- `ContributorLeaderboard`: Horizontal Bar display sorting team members by quantity of modifications.
- `IssuesTrendChart`: Line chart mapping ticket backlogs over time.
- `CodeChurnChart`: Shaded Area visual measuring code lines added versus removed.

---

## Verification Plan

### Automated Verification
1. **API Parameter Validation**: Assert that routes return `400 Bad Request` with useful error summaries when required items (e.g., mail structure, project slugs, or encryption payloads) are omitted.
2. **Connection Checks**: Ensure backend startup halts cleanly when `db.js` fails to dial the configured MongoDB cluster.
3. **Build Compilations**: Run `npm run build` inside `frontend/` to ensure no linting warnings or bundle compilation blocks occur.

### Manual Verification
1. **Authentication Flow**: Sign up, log out, log in. Ensure that navigating back to protected panels redirect to `/login` if token is deleted or expired.
2. **Theme Toggling**: Click light/dark toggle; confirm that the document class switches appropriately and values save in localStorage.
3. **Mock Check**: Log in with `demo@devtrackr.com` / `password123`. Click 'AI Insights' and export the PDF document. Validate the layout of the generated PDF file.
4. **Token Addition**: Insert a real GitHub PAT. Track a public repository, trigger a manual sync, and ensure Recharts load valid data.
