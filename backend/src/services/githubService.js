const { Octokit } = require('octokit');

const getOctokitInstance = (token) => {
  return new Octokit({ auth: token });
};

// Exponential backoff helper for rate limits (403 or 429)
const executeWithRetry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && (error.status === 429 || error.status === 403)) {
      console.warn(`[GitHub Service] Rate limit / forbidden hit. Retrying in ${delay}ms... (${retries} retries remaining)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return executeWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

/**
 * Fetches authenticated user info.
 */
const getUserProfile = async (token) => {
  const octokit = getOctokitInstance(token);
  const response = await executeWithRetry(() => octokit.rest.users.getAuthenticated());
  return response.data;
};

/**
 * Fetches user's repositories list.
 */
const getRepositoriesList = async (token) => {
  const octokit = getOctokitInstance(token);
  const response = await executeWithRetry(() => 
    octokit.rest.repos.listForAuthenticatedUser({ 
      sort: 'updated', 
      per_page: 100 
    })
  );
  return response.data.map(repo => ({
    id: repo.id,
    name: repo.name,
    owner: repo.owner.login,
    private: repo.private,
    description: repo.description,
    htmlUrl: repo.html_url
  }));
};

/**
 * Fetches commits of a repository in the last 90 days.
 */
const getCommits = async (token, owner, repo) => {
  const octokit = getOctokitInstance(token);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const since = ninetyDaysAgo.toISOString();

  const response = await executeWithRetry(() => 
    octokit.rest.repos.listCommits({
      owner,
      repo,
      since,
      per_page: 100
    })
  );
  return response.data;
};

/**
 * Fetches pull requests in the repository.
 */
const getPullRequests = async (token, owner, repo) => {
  const octokit = getOctokitInstance(token);
  const response = await executeWithRetry(() => 
    octokit.rest.pulls.list({
      owner,
      repo,
      state: 'all',
      per_page: 100
    })
  );
  return response.data;
};

/**
 * Fetches issues in the repository, filtering out pull requests.
 */
const getIssues = async (token, owner, repo) => {
  const octokit = getOctokitInstance(token);
  const response = await executeWithRetry(() => 
    octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      per_page: 100
    })
  );
  
  // Note: GitHub API includes PRs in listIssues responses, we filter them out.
  return response.data.filter(issue => !issue.pull_request);
};

/**
 * Fetches contributor activity statistics.
 */
const getContributorsStats = async (token, owner, repo) => {
  const octokit = getOctokitInstance(token);
  
  try {
    const response = await executeWithRetry(() => 
      octokit.rest.repos.getContributorsStats({
        owner,
        repo
      })
    );
    
    // GitHub may return 202 Accepted if stats are compiling. 
    if (response.status === 202) {
      console.warn('[GitHub Service] Contributors stats are compiling (202 status). Retrying once...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      const retryResponse = await octokit.rest.repos.getContributorsStats({ owner, repo });
      return retryResponse.data || [];
    }

    return response.data || [];
  } catch (err) {
    console.error('[GitHub Service] Failed to retrieve stats, falling back to contributors list:', err.message);
    
    // Fallback to simple contributors list
    const fallbackList = await executeWithRetry(() =>
      octokit.rest.repos.listContributors({
        owner,
        repo,
        per_page: 50
      })
    );
    
    return fallbackList.data.map(c => ({
      author: {
        login: c.login,
        avatar_url: c.avatar_url
      },
      total: c.contributions, // total commits
      weeks: []
    }));
  }
};

/**
 * Fetches code churn statistics (weekly additions and deletions).
 */
const getCodeFrequency = async (token, owner, repo) => {
  const octokit = getOctokitInstance(token);
  
  try {
    const response = await executeWithRetry(() => 
      octokit.rest.repos.getCodeFrequencyStats({
        owner,
        repo
      })
    );
    return response.data || []; // Returns arrays of [timestamp, additions, deletions]
  } catch (err) {
    console.error('[GitHub Service] Code frequency fetch failed:', err.message);
    return [];
  }
};

module.exports = {
  getUserProfile,
  getRepositoriesList,
  getCommits,
  getPullRequests,
  getIssues,
  getContributorsStats,
  getCodeFrequency
};
