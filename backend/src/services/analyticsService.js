const githubService = require('./githubService');

/**
 * Gathers and formats all repository metrics for the frontend dashboard.
 * @param {string} token GitHub Personal Access Token
 * @param {string} owner Repository owner login
 * @param {string} repo Repository name
 */
const getRepositoryMetrics = async (token, owner, repo) => {
  try {
    // 1. Fetch raw data in parallel to optimize response time
    const [
      rawCommits,
      rawPRs,
      rawIssues,
      rawContributors,
      rawCodeFrequency
    ] = await Promise.all([
      githubService.getCommits(token, owner, repo),
      githubService.getPullRequests(token, owner, repo),
      githubService.getIssues(token, owner, repo),
      githubService.getContributorsStats(token, owner, repo),
      githubService.getCodeFrequency(token, owner, repo)
    ]);

    // --- KPI & Summary Calculations ---
    const totalCommits = Array.isArray(rawCommits) ? rawCommits.length : 0;
    
    // PR breakdown
    const openPRs = (Array.isArray(rawPRs) ? rawPRs.filter(pr => pr.state === 'open') : []).length;
    const closedPRs = (Array.isArray(rawPRs) ? rawPRs.filter(pr => pr.state === 'closed' && !pr.merged_at) : []).length;
    const mergedPRs = (Array.isArray(rawPRs) ? rawPRs.filter(pr => pr.merged_at) : []).length;

    // Issue breakdown
    const openIssues = (Array.isArray(rawIssues) ? rawIssues.filter(issue => issue.state === 'open') : []).length;
    const closedIssues = (Array.isArray(rawIssues) ? rawIssues.filter(issue => issue.state === 'closed') : []).length;

    // Churn calculations (from code frequency over the last 12 weeks / approx 90 days)
    let additions = 0;
    let deletions = 0;
    
    const codeChurnChart = [];
    // rawCodeFrequency is an array of [timestamp, additions, deletions]
    // Filter to last 12 entries (approx 90 days) or all if less
    const recentFrequency = Array.isArray(rawCodeFrequency) ? rawCodeFrequency.slice(-12) : [];
    
    recentFrequency.forEach(([timestamp, add, del]) => {
      const dateStr = new Date(timestamp * 1000).toISOString().split('T')[0];
      const absDel = Math.abs(del);
      
      additions += add;
      deletions += absDel;

      codeChurnChart.push({
        date: dateStr,
        additions: add,
        deletions: absDel
      });
    });

    // --- Chart Formats ---
    
    // A. Commit velocity (Group by day for the last 14 days)
    const commitActivity = [];
    const dateMap = {};
    
    // Initialize date map with zeros for the last 14 days
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dateMap[key] = 0;
    }

    // Populate actual commits
    if (Array.isArray(rawCommits)) {
      rawCommits.forEach(c => {
        if (c.commit && c.commit.author && c.commit.author.date) {
          const dateKey = c.commit.author.date.split('T')[0];
          if (dateMap[dateKey] !== undefined) {
            dateMap[dateKey]++;
          }
        }
      });
    }

    // Convert date map to sorted array
    Object.keys(dateMap).sort().forEach(date => {
      commitActivity.push({
        date,
        commits: dateMap[date]
      });
    });

    // B. Issue backlog trend (daily open vs closed issues in last 14 days)
    const issuesTrend = [];
    const trendDates = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(23, 59, 59, 999); // check status at end of each day
      trendDates.push(d);
    }

    trendDates.forEach(date => {
      let openCount = 0;
      let closedCount = 0;

      if (Array.isArray(rawIssues)) {
        rawIssues.forEach(issue => {
          const createdDate = new Date(issue.created_at);
          const closedDate = issue.closed_at ? new Date(issue.closed_at) : null;

          if (createdDate <= date) {
            if (!closedDate || closedDate > date) {
              openCount++;
            } else {
              closedCount++;
            }
          }
        });
      }

      issuesTrend.push({
        date: date.toISOString().split('T')[0],
        open: openCount,
        closed: closedCount
      });
    });

    // C. Contributor leaderboard
    // Map rawContributors: [{ author: { login, avatar_url }, total, weeks: [] }]
    const contributors = Array.isArray(rawContributors) ? rawContributors.map(c => {
      let contribAdds = 0;
      let contribDels = 0;

      if (c.weeks && Array.isArray(c.weeks)) {
        c.weeks.forEach(w => {
          contribAdds += w.a || 0;
          contribDels += Math.abs(w.d || 0);
        });
      }

      return {
        username: c.author ? c.author.login : 'Unknown',
        avatarUrl: c.author ? c.author.avatar_url : '',
        commits: c.total || 0,
        additions: contribAdds,
        deletions: contribDels
      };
    }) : [];

    // Compile recent commit details (message and author) for AI analysis input
    const recentCommits = Array.isArray(rawCommits) 
      ? rawCommits.slice(0, 30).map(c => ({
          author: c.commit?.author?.name || c.commit?.author?.email || 'Unknown',
          message: c.commit?.message || ''
        }))
      : [];

    return {
      summary: {
        totalCommits,
        openPRs,
        openIssues,
        closedIssues,
        additions,
        deletions
      },
      charts: {
        commitActivity,
        prStatus: {
          open: openPRs,
          closed: closedPRs,
          merged: mergedPRs
        },
        codeChurn: codeChurnChart,
        issuesTrend
      },
      contributors,
      recentCommits
    };

  } catch (error) {
    console.error('[Analytics Service] Error compiling repo metrics:', error.message);
    throw error;
  }
};

module.exports = {
  getRepositoryMetrics
};
