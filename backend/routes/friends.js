import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { fetchLeetCodeUserStats } from '../utils/leetcodeApi.js';

const router = express.Router();

// @route   POST /api/friends/follow
// @desc    Follow a LeetCode user
// @access  Private
router.post('/follow', authenticateToken, [
  body('leetcodeUsername')
    .trim()
    .notEmpty()
    .withMessage('LeetCode username is required')
    .isLength({ min: 1 })
    .withMessage('LeetCode username must not be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { leetcodeUsername } = req.body;
    const currentUserId = req.user._id;

    // Check if LeetCode user exists by fetching their stats
    try {
      await fetchLeetCodeUserStats(leetcodeUsername);
    } catch (error) {
      return res.status(404).json({ error: 'LeetCode user not found or profile is private' });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already following
    if (currentUser.followingLeetCode.includes(leetcodeUsername)) {
      return res.status(400).json({ error: 'You are already following this LeetCode user' });
    }

    // Add to following list
    currentUser.followingLeetCode.push(leetcodeUsername);
    await currentUser.save();

    res.json({
      message: 'Successfully following LeetCode user',
      leetcodeUsername,
      followingCount: currentUser.followingLeetCode.length
    });
  } catch (error) {
    console.error('Follow LeetCode user error:', error);
    res.status(500).json({ error: 'Server error following LeetCode user' });
  }
});

// @route   DELETE /api/friends/unfollow/:leetcodeUsername
// @desc    Unfollow a LeetCode user
// @access  Private
router.delete('/unfollow/:leetcodeUsername', authenticateToken, async (req, res) => {
  try {
    const { leetcodeUsername } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);

    // Check if following
    if (!currentUser.followingLeetCode.includes(leetcodeUsername)) {
      return res.status(400).json({ error: 'You are not following this LeetCode user' });
    }

    // Remove from following list
    currentUser.followingLeetCode = currentUser.followingLeetCode.filter(
      username => username !== leetcodeUsername
    );
    await currentUser.save();

    res.json({
      message: 'Successfully unfollowed LeetCode user',
      leetcodeUsername,
      followingCount: currentUser.followingLeetCode.length
    });
  } catch (error) {
    console.error('Unfollow LeetCode user error:', error);
    res.status(500).json({ error: 'Server error unfollowing LeetCode user' });
  }
});

// @route   GET /api/friends/following
// @desc    Get list of followed LeetCode users with their stats
// @access  Private
router.get('/following', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser.followingLeetCode.length) {
      return res.json({
        following: [],
        totalFollowing: 0
      });
    }

    // Fetch stats for all followed users
    const followingStats = await Promise.allSettled(
      currentUser.followingLeetCode.map(async (username) => {
        try {
          const stats = await fetchLeetCodeUserStats(username);
          return {
            username,
            ...stats,
            isFollowing: true
          };
        } catch (error) {
          console.error(`Error fetching stats for ${username}:`, error);
          return {
            username,
            error: 'Failed to fetch stats',
            isFollowing: true
          };
        }
      })
    );

    const following = followingStats
      .map(result => result.status === 'fulfilled' ? result.value : result.reason)
      .filter(user => !user.error || user.username); // Keep users even if stats failed

    res.json({
      following,
      totalFollowing: following.length
    });
  } catch (error) {
    console.error('Get following list error:', error);
    res.status(500).json({ error: 'Server error fetching following list' });
  }
});

// @route   GET /api/friends/search
// @desc    Search for LeetCode users to follow
// @access  Private
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q: searchQuery } = req.query;
    const currentUserId = req.user._id;

    if (!searchQuery || searchQuery.trim().length < 1) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const currentUser = await User.findById(currentUserId);
    const searchUsername = searchQuery.trim();

    // Check if user is already following this username
    const isAlreadyFollowing = currentUser.followingLeetCode.includes(searchUsername);

    if (isAlreadyFollowing) {
      return res.json({
        message: 'You are already following this user',
        user: null,
        isAlreadyFollowing: true
      });
    }

    // Try to fetch LeetCode stats for the searched username
    try {
      const stats = await fetchLeetCodeUserStats(searchUsername);
      
      res.json({
        user: {
          username: searchUsername,
          ...stats,
          isFollowing: false
        },
        isAlreadyFollowing: false
      });
    } catch (error) {
      res.status(404).json({ 
        error: 'LeetCode user not found or profile is private',
        user: null,
        isAlreadyFollowing: false
      });
    }
  } catch (error) {
    console.error('Search LeetCode user error:', error);
    res.status(500).json({ error: 'Server error searching for LeetCode user' });
  }
});

export default router; 