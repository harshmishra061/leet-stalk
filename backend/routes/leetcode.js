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


export default router; 