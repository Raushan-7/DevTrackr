# Implementation Plan - DevTrackr Refactoring

This plan details the changes required to update DevTrackr branding, remove all demo/mock/seed data, implement robust empty state UIs, standardize AI model consistency to Gemini, and verify the React Query setup.

## User Review Required

> [!WARNING]
> All demo credentials and local fallback mock data will be deleted. Ensure you have a valid GitHub Personal Access Token (PAT) with `repo` and `read:user` scopes configured in the settings after the deployment.
> The database seeder script `backend/src/scripts/seed.js` will be deleted.

## Open Questions

None. The requirements are clear, and the codebase structure has been researched and mapped out.

## Proposed Changes

---

### CHANGE 1 — UPDATE BRANDING

We will update the tagline and document title across all occurrences.

#### [MODIFY] [Sidebar.jsx](file:///e:/Dev%20Tracker/frontend/src/components/Sidebar.jsx)
- Replace line 61 tagline:
  - **Old**: `"Increase delivery velocity with AI performance analysis."`
  - **New**: `"Turn your GitHub activity into actionable team insights."`

#### [MODIFY] [index.html](file:///e:/Dev%20Tracker/frontend/index.html)
- Update page title to: `<title>DevTrackr - Turn your GitHub activity into actionable team insights.</title>`
- Add meta tag: `<meta name="description" content="Turn your GitHub activity into actionable team insights." />`

---

### CHANGE 2 — REMOVE ALL DEMO/MOCK/SEED DATA

We will delete mock data, mock files, and references.

#### [DELETE] [seed.js](file:///e:/Dev%20Tracker/backend/src/scripts/seed.js)
- Remove backend seeding script entirely.

#### [MODIFY] [Login.jsx](file:///e:/Dev%20Tracker/frontend/src/pages/Login.jsx)
- Remove the "Seed account reminder helper" banner UI.

#### [MODIFY] [github.js](file:///e:/Dev%20Tracker/backend/src/routes/github.js)
- Delete the `MOCK_REPOS` and `MOCK_STATS` objects.
- Remove `dummy_` token checks from `getDecryptedToken` and routes.
- Remove fallback logic in `/repos`, `/repos/:owner/:repo/stats`, and `/repos/:owner/:repo/contributors`.

#### [MODIFY] [reports.js](file:///e:/Dev%20Tracker/backend/src/routes/reports.js)
- Remove the `if (reportId === 'demo')` hardcoded fallback block in `/export/:reportId` route.

#### [NEW] [.env.example](file:///e:/Dev%20Tracker/backend/.env.example)
- Expose required env configuration variables with instructions. Ensure `GEMINI_API_KEY` is present and **NO** `ANTHROPIC_API_KEY` is referenced.

---

### CHANGE 3 — ADD EMPTY STATE UI

We will implement dedicated centered empty state components matching the user instructions.

#### [MODIFY] [Repos.jsx](file:///e:/Dev%20Tracker/frontend/src/pages/Repos.jsx)
- Update empty repos list state to display: `"No repositories found. Add your GitHub PAT in Settings to get started."`
- Display centered layout, `GitFork` icon, and a call-to-action button link: `"Go to Settings"`.

#### [MODIFY] [Dashboard.jsx](file:///e:/Dev%20Tracker/frontend/src/pages/Dashboard.jsx)
- Update empty stats state to display: `"No data yet. Select a repository and run an analysis."`
- Display centered layout, `Database` icon, and a call-to-action button link: `"Go to Repositories"`.

#### [MODIFY] [AIInsights.jsx](file:///e:/Dev%20Tracker/frontend/src/pages/AIInsights.jsx)
- Update empty insights state to display: `"No insights generated yet. Click Analyze on any repository."`
- Display centered layout, `Sparkles` icon, and a call-to-action button link: `"Analyze Now"`.

#### [MODIFY] [ContributorLeaderboard.jsx](file:///e:/Dev%20Tracker/frontend/src/components/charts/ContributorLeaderboard.jsx)
- Update empty state to display: `"No contributor data available for this repository."` with a `👥` emoji icon.

#### [MODIFY] [CommitActivityChart.jsx](file:///e:/Dev%20Tracker/frontend/src/components/charts/CommitActivityChart.jsx)
- Add centered `📊` emoji placeholder if empty.

#### [MODIFY] [PRStatusChart.jsx](file:///e:/Dev%20Tracker/frontend/src/components/charts/PRStatusChart.jsx)
- Add centered `🔀` emoji placeholder if empty.

#### [MODIFY] [CodeChurnChart.jsx](file:///e:/Dev%20Tracker/frontend/src/components/charts/CodeChurnChart.jsx)
- Add centered `📈` emoji placeholder if empty.

#### [MODIFY] [IssuesTrendChart.jsx](file:///e:/Dev%20Tracker/frontend/src/components/charts/IssuesTrendChart.jsx)
- Add centered `⚠️` emoji placeholder if empty.

---

### CHANGE 4 — FIX AI MODEL CONSISTENCY

Standardize to Gemini and remove Anthropic references.

#### [MODIFY] [aiService.js](file:///e:/Dev%20Tracker/backend/src/services/aiService.js)
- Explicitly instantiate model at module-level (using CommonJS module syntax):
  ```javascript
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  ```
- Prompt Gemini to return **ONLY** valid JSON (no markdown, no backticks, no preamble).
- Safely parse the output with a `try/catch` wrapper around `JSON.parse`.
- Replace any references in comments/docs.

---

### CHANGE 5 — QueryClientProvider VERIFICATION

#### [MODIFY] [App.jsx](file:///e:/Dev%20Tracker/frontend/src/App.jsx)
- Already contains `QueryClientProvider` and `queryClient` setup. We will verify and ensure it remains correct.

---

## Verification Plan

### Automated Verification
- Run a frontend build `npm run build` to verify clean compilation.
- Execute a test script to query backend routes and check if they return error codes instead of hardcoded demo data when accessed without a valid token.

### Manual Verification
- Test user interface empty states by logging in with a new user account (with no PAT configured) and navigating to Repositories, Dashboard, and AI Insights.
- Verify that the tagline on the Sidebar has changed to the new tagline.
- Verify index.html page title in browser tabs.
