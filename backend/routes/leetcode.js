import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  fetchLeetCodeProfile, 
  fetchLeetCodeContestData, 
  fetchRecentSubmissions,
  parseLeetCodeData,
  calculateProblemsToday
} from '../utils/leetcodeApi.js';

const router = express.Router();

// @route   POST /api/leetcode/fetch/:username
// @desc    Fetch LeetCode profile data (no storage)
// @access  Private
router.post('/fetch/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ error: 'LeetCode username is required' });
    }

    // Check if this is the user's own profile or if they're allowed to fetch
    const targetUser = await User.findOne({ username: username });
    if (targetUser && targetUser._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only fetch your own LeetCode profile' });
    }

    console.log(`🔄 Fetching fresh LeetCode data for: ${username}`);

    // Fetch fresh data from LeetCode API
    const [profileData, contestData, recentSubmissions] = await Promise.all([
      fetchLeetCodeProfile(username),
      fetchLeetCodeContestData(username),
      fetchRecentSubmissions(username, 30)
    ]);

    if (!profileData || !profileData.solvedStats) {
      return res.status(404).json({ error: 'LeetCode profile not found' });
    }

    // Calculate today's problems
    const today = new Date().toISOString().split('T')[0];
    console.log(`🔍 Debug: Recent submissions count: ${recentSubmissions?.length || 0}`);
    console.log(`🔍 Debug: First few submissions:`, recentSubmissions?.slice(0, 3));
    
    const problemsSolvedToday = recentSubmissions && Array.isArray(recentSubmissions)
      ? calculateProblemsToday(recentSubmissions)
      : 0;

    // No need to update username as it's already the main username

    const profileResponse = {
      leetcodeUsername: username,
      profileData: {
        totalSolved: profileData.solvedStats.totalSolved || 0,
        easySolved: profileData.solvedStats.easySolved || 0,
        mediumSolved: profileData.solvedStats.mediumSolved || 0,
        hardSolved: profileData.solvedStats.hardSolved || 0,
        problemsSolvedToday: problemsSolvedToday
      },
      contestData: contestData ? {
        contestRating: contestData.rating,
        contestRanking: contestData.ranking,
        attendedContestsCount: contestData.attendedContestsCount || 0
      } : null,
      progressPercentage: ((profileData.solvedStats.totalSolved / 3000) * 100).toFixed(1),
      lastFetched: new Date()
    };

    console.log(`✅ Fresh data fetched for: ${username}`);
    console.log(`📊 Total solved: ${profileData.solvedStats.totalSolved}`);
    console.log(`📊 Contest rating: ${contestData?.rating || 'null'}`);
    console.log(`📊 Problems solved today: ${problemsSolvedToday}`);

    res.json({
      message: 'LeetCode profile fetched successfully',
      profile: profileResponse
    });
  } catch (error) {
    console.error('Fetch LeetCode profile error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch LeetCode profile',
      details: error.message 
    });
  }
});

// @route   GET /api/leetcode/profile
// @desc    Get user's current LeetCode profile (fresh fetch)
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    if (!req.user.username) {
      return res.status(404).json({ 
        error: 'No username found',
        message: 'User account error - no username'
      });
    }

    console.log(`🔄 Fetching fresh profile for: ${req.user.username}`);

    // Fetch fresh data from LeetCode API
    const [profileData, contestData, recentSubmissions] = await Promise.all([
      fetchLeetCodeProfile(req.user.username),
      fetchLeetCodeContestData(req.user.username),
      fetchRecentSubmissions(req.user.username, 30)
    ]);

    if (!profileData || !profileData.solvedStats) {
      return res.status(404).json({ error: 'LeetCode profile not found' });
    }

    // Calculate today's problems
    const today = new Date().toISOString().split('T')[0];
    console.log(`🔍 Debug: Recent submissions count: ${recentSubmissions?.length || 0}`);
    console.log(`🔍 Debug: First few submissions:`, recentSubmissions?.slice(0, 3));
    
    const problemsSolvedToday = recentSubmissions && Array.isArray(recentSubmissions)
      ? calculateProblemsToday(recentSubmissions) 
      : 0;

    const profileResponse = {
      leetcodeUsername: req.user.username,
      profileData: {
        totalSolved: profileData.solvedStats.totalSolved || 0,
        easySolved: profileData.solvedStats.easySolved || 0,
        mediumSolved: profileData.solvedStats.mediumSolved || 0,
        hardSolved: profileData.solvedStats.hardSolved || 0,
        problemsSolvedToday: problemsSolvedToday
      },
      contestData: contestData ? {
        contestRating: contestData.rating,
        contestRanking: contestData.ranking,
        attendedContestsCount: contestData.attendedContestsCount || 0
      } : null,
      progressPercentage: ((profileData.solvedStats.totalSolved / 3000) * 100).toFixed(1),
      lastFetched: new Date()
    };

    console.log(`✅ Fresh profile data returned for: ${req.user.username}`);

    res.json({
      profile: profileResponse
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get LeetCode profile',
      details: error.message 
    });
  }
});

// @route   GET /api/leetcode/debug/:username
// @desc    Debug endpoint to get raw LeetCode data
// @access  Public (for testing)
router.get('/debug/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    console.log(`🔍 Debug: Fetching data for ${username}`);

    // Fetch fresh data from LeetCode API
    const [profileData, contestData, recentSubmissions] = await Promise.all([
      fetchLeetCodeProfile(username),
      fetchLeetCodeContestData(username),
      fetchRecentSubmissions(username, 30)
    ]);

    // Calculate today's problems
    const today = new Date().toISOString().split('T')[0];
    console.log(`🔍 Debug: Recent submissions count: ${recentSubmissions?.length || 0}`);
    console.log(`🔍 Debug: First few submissions:`, recentSubmissions?.slice(0, 3));
    
    const problemsSolvedToday = recentSubmissions && Array.isArray(recentSubmissions)
      ? calculateProblemsToday(recentSubmissions) 
      : 0;

    res.json({
      debug: true,
      username,
      profile: profileData?.profile || null,
      solvedStats: profileData?.solvedStats || null,
      contestData: contestData || null,
      problemsSolvedToday,
      recentSubmissionsCount: recentSubmissions?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ 
      error: 'Debug fetch failed',
      details: error.message 
    });
  }
});

export default router; 