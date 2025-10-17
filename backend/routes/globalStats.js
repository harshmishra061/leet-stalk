import express from 'express';
import GlobalStats from '../models/GlobalStats.js';

const router = express.Router();

// @route   GET /api/global-stats
// @desc    Get global stats (visitors, likes, dislikes)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const stats = await GlobalStats.getGlobalStats();
    
    res.json({
      visitors: stats.visitors || 0,
      likes: stats.likes || 0,
      dislikes: stats.dislikes || 0
    });
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({ error: 'Server error fetching global stats' });
  }
});

// @route   POST /api/global-stats/visitor
// @desc    Increment global visitor count
// @access  Public
router.post('/visitor', async (req, res) => {
  try {
    const stats = await GlobalStats.incrementVisitors();
    
    res.json({
      visitors: stats.visitors,
      likes: stats.likes || 0,
      dislikes: stats.dislikes || 0
    });
  } catch (error) {
    console.error('Error incrementing visitor count:', error);
    res.status(500).json({ error: 'Server error incrementing visitor count' });
  }
});

// @route   POST /api/global-stats/like
// @desc    Increment global like count
// @access  Public
router.post('/like', async (req, res) => {
  try {
    const stats = await GlobalStats.incrementLikes();
    
    res.json({
      visitors: stats.visitors || 0,
      likes: stats.likes,
      dislikes: stats.dislikes || 0
    });
  } catch (error) {
    console.error('Error incrementing like count:', error);
    res.status(500).json({ error: 'Server error incrementing like count' });
  }
});

// @route   POST /api/global-stats/dislike
// @desc    Increment global dislike count
// @access  Public
router.post('/dislike', async (req, res) => {
  try {
    const stats = await GlobalStats.incrementDislikes();
    
    res.json({
      visitors: stats.visitors || 0,
      likes: stats.likes || 0,
      dislikes: stats.dislikes
    });
  } catch (error) {
    console.error('Error incrementing dislike count:', error);
    res.status(500).json({ error: 'Server error incrementing dislike count' });
  }
});

export default router;

