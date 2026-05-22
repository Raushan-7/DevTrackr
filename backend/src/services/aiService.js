const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Analyzes repository metrics and recent activity to generate a structured AI sprint report.
 * Uses Gemini structured JSON output matching the expected frontend structure.
 */
const generateAnalysisReport = async (owner, repo, statsData, userGeminiKey = null) => {
  try {
    const apiKey = userGeminiKey || process.env.GEMINI_API_KEY;
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

    const responseSchema = {
      type: 'object',
      properties: {
        sprintSummary: { type: 'string' },
        gaugeScore: { type: 'integer' },
        bottlenecks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              badge: { type: 'string' },
              description: { type: 'string' }
            },
            required: ['badge', 'description']
          }
        },
        priorityBoard: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              task: { type: 'string' },
              priority: { type: 'string' }
            },
            required: ['task', 'priority']
          }
        },
        recommendations: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['sprintSummary', 'gaugeScore', 'bottlenecks', 'priorityBoard', 'recommendations']
    };

    const prompt = `
      You are an expert developer productivity advisor. Analyze the following developer metrics and recent history for the repository "${owner}/${repo}" over the last 90 days.
      
      METRICS SUMMARY:
      - Total Commits: ${statsData.summary.totalCommits}
      - Open Pull Requests: ${statsData.summary.openPRs}
      - Open Issues: ${statsData.summary.openIssues}
      - Closed Issues: ${statsData.summary.closedIssues}
      - Lines Added: ${statsData.summary.additions}
      - Lines Deleted: ${statsData.summary.deletions}
      
      CONTRIBUTOR LEADERBOARD:
      ${statsData.contributors.map(c => `- ${c.username}: ${c.commits} commits, +${c.additions} lines, -${c.deletions} lines`).join('\n')}
      
      RECENT COMMITS:
      ${statsData.recentCommits ? statsData.recentCommits.map(c => `- [${c.author}] ${c.message}`).slice(0, 30).join('\n') : 'No recent commit details provided.'}

      Based on this data:
      1. Write a cohesive, insightful 3-4 sentence "sprintSummary" that highlights velocity, major activity focus, and team coordination.
      2. Compute a "gaugeScore" (integer 0-100) representing team productivity health.
         - 80-100: Stable and high velocity, low open PR latency, good issue closure rate.
         - 60-79: Normal velocity with minor bottlenecks or backlog creep.
         - Under 60: Blocked PRs, excessive code churn with few completions, or stagnant issue backlogs.
      3. Identify 1 to 3 "bottlenecks" containing:
         - "badge": A short 1-3 word keyword (e.g. "PR Review Delay", "High Churn Rate", "Stale Backlog").
         - "description": A concise explanation of the block and what metric signals it.
      4. Suggest a "priorityBoard" listing 2 to 5 actionable tasks for the upcoming cycle:
         - "task": The action description.
         - "priority": Urgency level ("high", "medium", or "low").
      5. Provide 2 to 4 high-level strategic "recommendations" (strings) for team workflow optimization.

      CRITICAL: You must return ONLY valid JSON matching the schema below.
      Do NOT wrap the output in markdown formatting or code blocks (do NOT include \`\`\`json or \`\`\` backticks).
      Do NOT include any preamble, introduction, or explanation text.
    `;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const text = result.response.candidates[0].content.parts[0].text;

    let parsed
    try {
      const cleaned = text.replace(/```json|```/g, "").trim()
      parsed = JSON.parse(cleaned)
    } catch (e) {
      throw new Error("Gemini returned invalid JSON: " + e.message)
    }

    return parsed;
  } catch (error) {
    console.error('[AI Service] Analysis generation failed:', error.message);
    throw new Error(`Gemini AI analysis failed: ${error.message}`);
  }
};

/**
 * Generates a release notes/changelog summary from a list of commit messages.
 */
const summarizeCommits = async (commits, userGeminiKey = null) => {
  try {
    if (!commits || commits.length === 0) {
      return { summary: 'No commits to summarize.' };
    }

    const apiKey = userGeminiKey || process.env.GEMINI_API_KEY;
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

    const commitListText = commits.map(c => `- ${c}`).join('\n');
    const prompt = `
      Please summarize the following batch of code commit messages into a concise changelog / release notes summary.
      Categorize changes into logical sections (e.g. Features, Bug Fixes, Refactoring, Documentation) if applicable.
      Keep it readable, bulleted, and professional.

      COMMITS:
      ${commitListText}
    `;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });
    const text = result.response.candidates[0].content.parts[0].text;
    return { summary: text };
  } catch (error) {
    console.error('[AI Service] Commit summarization failed:', error.message);
    throw new Error(`Gemini commit summarization failed: ${error.message}`);
  }
};

module.exports = {
  generateAnalysisReport,
  summarizeCommits
};
