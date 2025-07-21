import axios from 'axios';
import { DateTime } from 'luxon';

// Official LeetCode GraphQL API configuration
const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests
const REQUEST_TIMEOUT = 10000;

// Rate limiting
let lastRequestTime = 0;

/**
 * Add delay for rate limiting
 */
function addDelay() {
  return new Promise(resolve => {
    const timeSinceLastRequest = Date.now() - lastRequestTime;
    const delayNeeded = Math.max(0, RATE_LIMIT_DELAY - timeSinceLastRequest);
    
    if (delayNeeded > 0) {
      console.log(`[GRAPHQL] Rate limiting: waiting ${delayNeeded}ms`);
    }
    
    setTimeout(() => {
      lastRequestTime = Date.now();
      resolve();
    }, delayNeeded);
  });
}

/**
 * Fetch LeetCode profile using official GraphQL API
 */
export const fetchLeetCodeProfile = async (username) => {
  try {
    console.log(`Fetching FRESH LeetCode profile for: ${username} (cache disabled)`);
    
    // Rate limiting
    await addDelay();
    
    console.log(`[GRAPHQL] Fetching profile for: ${username}`);
    
    const query = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              realName
              userAvatar
              ranking
              reputation
              aboutMe
              school
              company
              skillTags
              countryName
              websites
            }
            submitStats {
              totalSubmissionNum {
                count
              }
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `,
      variables: { username }
    };

    const response = await axios.post(LEETCODE_GRAPHQL_URL, query, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; LeetStalk/1.0)',
        'Referer': 'https://leetcode.com/'
      }
    });

    const userData = response.data.data?.matchedUser;
    if (!userData || !userData.username) {
      throw new Error(`LeetCode user "${username}" not found. Please verify the username exists on LeetCode.com`);
    }

    // Extract solved stats from GraphQL response
    const solvedStats = {
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      acSubmissions: 0
    };

    // Debug logging for GraphQL API
    console.log(`[GRAPHQL] Raw submit stats for ${username}:`, {
      acSubmissionNum: userData.submitStats?.acSubmissionNum
    });
    
    if (userData.submitStats?.acSubmissionNum) {
      userData.submitStats.acSubmissionNum.forEach(stat => {
        const count = stat.count || 0;
        solvedStats.acSubmissions += count;
        
        if (stat.difficulty === 'Easy') solvedStats.easySolved = count;
        else if (stat.difficulty === 'Medium') solvedStats.mediumSolved = count;
        else if (stat.difficulty === 'Hard') solvedStats.hardSolved = count;
      });
      
      // Calculate totalSolved as sum of difficulties (correct approach)
      solvedStats.totalSolved = solvedStats.easySolved + solvedStats.mediumSolved + solvedStats.hardSolved;
    }
    
    console.log(`[GRAPHQL] Calculated solved stats:`, solvedStats);

    const result = {
      username: userData.username,
      profile: {
        realName: userData.profile?.realName || '',
        userAvatar: userData.profile?.userAvatar || null,
        ranking: userData.profile?.ranking || null,
        reputation: userData.profile?.reputation || 0,
        aboutMe: userData.profile?.aboutMe || '',
        school: userData.profile?.school || '',
        company: userData.profile?.company || '',
        skillTags: userData.profile?.skillTags || [],
        countryName: userData.profile?.countryName || '',
        gitHub: userData.profile?.websites?.find(w => w.includes('github')) || '',
        linkedIN: userData.profile?.websites?.find(w => w.includes('linkedin')) || '',
        twitter: userData.profile?.websites?.find(w => w.includes('twitter')) || ''
      },
      solvedStats,
      source: 'leetcode-graphql'
    };

    console.log(`✅ Successfully fetched FRESH ${username} using GraphQL API (no cache)`);
    return result;

  } catch (error) {
    console.error('Error in fetchLeetCodeProfile:', error);
    
    if (error.response?.status === 429) {
      throw new Error('LeetCode API rate limit reached. Please try again in a few minutes.');
    }
    
    if (error.response?.status === 404 || !error.response?.data?.data?.matchedUser) {
      throw new Error(`LeetCode user "${username}" not found. Please verify the username exists on LeetCode.com`);
    }
    
    if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection and try again.');
    }
    
    throw new Error(`Failed to fetch LeetCode profile: ${error.message}`);
  }
};

/**
 * Fetch LeetCode user stats (wrapper around fetchLeetCodeProfile)
 */
export const fetchLeetCodeUserStats = async (username) => {
  try {
    const profile = await fetchLeetCodeProfile(username);
    return {
      username: profile.username,
      totalSolved: profile.solvedStats.totalSolved,
      easySolved: profile.solvedStats.easySolved,
      mediumSolved: profile.solvedStats.mediumSolved,
      hardSolved: profile.solvedStats.hardSolved,
      ranking: profile.profile.ranking,
      reputation: profile.profile.reputation,
      avatar: profile.profile.userAvatar,
      realName: profile.profile.realName
    };
  } catch (error) {
    throw error;
  }
};

export const fetchLeetCodeContestData = async (username) => {
  try {
    console.log(`Fetching contest data for: ${username}`);
    
    const query = {
      query: `
        query getUserContestRanking($username: String!) {
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            topPercentage
          }
        }
      `,
      variables: { username }
    };

    const response = await axios.post(LEETCODE_GRAPHQL_URL, query, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; LeetStalk/1.0)',
        'Referer': 'https://leetcode.com/'
      }
    });

    return response.data.data?.userContestRanking || null;
  } catch (error) {
    console.error('Error fetching contest data:', error);
    return null;
  }
};

export const fetchRecentSubmissions = async (username, limit = 10) => {
  try {
    console.log(`Fetching FRESH recent submissions for: ${username} (cache disabled)`);
    
    const query = {
      query: `
        query getRecentSubmissions($username: String!, $limit: Int) {
          recentSubmissionList(username: $username, limit: $limit) {
            title
            titleSlug
            timestamp
            statusDisplay
            lang
          }
        }
      `,
      variables: { username, limit }
    };

    const response = await axios.post(LEETCODE_GRAPHQL_URL, query, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; LeetStalk/1.0)',
        'Referer': 'https://leetcode.com/'
      }
    });

    return response.data.data?.recentSubmissionList || [];
  } catch (error) {
    console.error('Error fetching recent submissions:', error);
    return [];
  }
};

/**
 * Fetch LeetCode submission calendar for more accurate date range calculations
 */
export const fetchSubmissionCalendar = async (username) => {
  try {
    console.log(`Fetching submission calendar for: ${username}`);
    
    const query = {
      query: `
        query userProfileCalendar($username: String!, $year: Int) {
          matchedUser(username: $username) {
            userCalendar(year: $year) {
              submissionCalendar
            }
          }
        }
      `,
      variables: { 
        username,
        year: new Date().getFullYear()
      }
    };

    const response = await axios.post(LEETCODE_GRAPHQL_URL, query, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; LeetStalk/1.0)',
        'Referer': 'https://leetcode.com/'
      }
    });

    const calendarData = response.data.data?.matchedUser?.userCalendar?.submissionCalendar;
    if (calendarData) {
      // Parse the submission calendar JSON string
      return JSON.parse(calendarData);
    }
    return {};
  } catch (error) {
    console.error('Error fetching submission calendar:', error);
    return {};
  }
};

/**
 * Get the current date in Pacific Time (LeetCode's timezone)
 */
export const getPacificToday = () => {
  // Get current time in Pacific timezone 
  const now = new Date();
  const pacificNow = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  
  // Get today's date string in Pacific timezone
  const pacificDateStr = now.toLocaleDateString("en-CA", {timeZone: "America/Los_Angeles"}); // YYYY-MM-DD format
  
  // Create start and end of day using Date constructor with the Pacific date
  // This ensures we get midnight to midnight in Pacific Time
  const todayStart = new Date(pacificDateStr + ' 00:00:00 PDT'); // Start of day in Pacific Time
  const todayEnd = new Date(pacificDateStr + ' 23:59:59 PDT');   // End of day in Pacific Time
  
  return { todayStart, todayEnd, pacificNow };
};

/**
 * Get Pacific Time date range from date strings
 */
const getPacificDateRange = (startDateStr, endDateStr) => {
  // Parse YYYY-MM-DD format and create dates in Pacific timezone
  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
  
  // Get current time in Pacific timezone to ensure we're working in the right timezone
  const pacificNow = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  
  // Create start date at midnight Pacific Time
  const startPacific = new Date(pacificNow);
  startPacific.setFullYear(startYear, startMonth - 1, startDay);
  startPacific.setHours(0, 0, 0, 0);
  
  // Create end date at end of day Pacific Time
  const endPacific = new Date(pacificNow);
  endPacific.setFullYear(endYear, endMonth - 1, endDay);
  endPacific.setHours(23, 59, 59, 999);
  
  return { startPacific, endPacific };
};

/**
 * Calculate problems solved from submission calendar
 * Uses raw submission count data directly without estimation
 */
export const calculateProblemsInRangeFromCalendar = (submissionCalendar, startDate, endDate) => {
  if (!submissionCalendar || typeof submissionCalendar !== 'object') {
    return { total: 0, easy: 0, medium: 0, hard: 0 };
  }

  let totalCount = 0;
  
  // Convert date strings to timestamps for comparison  
  const startTimestamp = Math.floor(new Date(startDate + 'T00:00:00.000Z').getTime() / 1000);
  const endTimestamp = Math.floor(new Date(endDate + 'T23:59:59.999Z').getTime() / 1000);
  
  // Iterate through calendar data
  for (const [timestampStr, count] of Object.entries(submissionCalendar)) {
    const timestamp = parseInt(timestampStr);
    
    // Check if this day falls within our date range
    if (timestamp >= startTimestamp && timestamp <= endTimestamp) {
      totalCount += parseInt(count) || 0;
    }
  }

  console.log(`📊 Calendar data ${startDate} to ${endDate}: ${totalCount} total count`);
  
  return {
    total: totalCount,
    easy: 0, // Calendar doesn't provide difficulty breakdown
    medium: 0,
    hard: 0
  };
};





/**
 * Calculate problems solved today from recent submissions
 * Uses LeetCode's Pacific Time for "today" calculation
 */
export const calculateProblemsToday = (recentSubmissions) => {
  console.log('harsh', recentSubmissions)
  if (!recentSubmissions || !Array.isArray(recentSubmissions)) {
    return 0;
  }

  // Helper: is submission today in UTC
  function isSubmissionTodayInUTC(submissionTimestamp) {
    const submissionDate = new Date(Number(submissionTimestamp) * 1000).toISOString().split('T')[0];
    const todayDate = new Date().toISOString().split('T')[0];
    return submissionDate === todayDate;
  }

  const solvedToday = new Set();
  recentSubmissions.forEach(submission => {
    if (submission.statusDisplay === 'Accepted' && isSubmissionTodayInUTC(submission.timestamp)) {
      solvedToday.add(submission.titleSlug);
    }
  });
  return solvedToday.size;
};

export const parseLeetCodeData = (apiData, contestData, recentSubmissions) => {
  const { profile, solvedStats } = apiData;
  
  const totalQuestions = 3000;
  const totalSolved = solvedStats.totalSolved;
  const problemsSolvedToday = calculateProblemsToday(recentSubmissions);
  
  return {
    profileData: {
      totalSolved: totalSolved,
      totalQuestions: totalQuestions,
      easySolved: solvedStats.easySolved,
      mediumSolved: solvedStats.mediumSolved,
      hardSolved: solvedStats.hardSolved,
      acceptanceRate: totalSolved > 0 ? ((totalSolved / totalQuestions) * 100).toFixed(2) : 0,
      ranking: profile.ranking || null,
      problemsSolvedToday: problemsSolvedToday,
      contributionPoints: 0,
      reputation: profile.reputation || 0
    },
    contestData: {
      contestRating: contestData?.rating || null,
      contestRanking: contestData?.globalRanking || null,
      attendedContestsCount: contestData?.attendedContestsCount || 0,
      topPercentage: contestData?.topPercentage || null
    },
    recentSubmissions: (recentSubmissions || []).slice(0, 10).map(submission => {
      return {
        title: submission.title || 'Unknown Problem',
        difficulty: 'Unknown', // Would need separate query to get difficulty
        solvedAt: submission.timestamp ? new Date(submission.timestamp * 1000) : new Date(),
        problemUrl: submission.titleSlug ? `https://leetcode.com/problems/${submission.titleSlug}/` : '#',
        status: submission.statusDisplay || 'Completed'
      };
    }),
    badges: [],
    streakData: {
      currentStreak: 0,
      longestStreak: 0,
      lastSolvedDate: new Date()
    },
    lastFetched: new Date(),
    source: apiData.source
  };
}; 