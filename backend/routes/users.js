import express from 'express';

const router = express.Router();


// @route   GET /api/users/leaderboard
// @desc    Get LeetCode users leaderboard (friends + some default users)
// @access  Public (but better with auth for personalized results)
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = [];
    let leetcodeUsernames = [];

    // Check if user is authenticated to get their friends
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('🔍 Leaderboard request - Auth header present:', !!authHeader);
    console.log('🔍 Token extracted:', !!token);
    
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        console.log('🔍 Token decoded successfully, userId:', decoded.userId);
        
        const User = await import('../models/User.js');
        
        const user = await User.default.findById(decoded.userId)
          .select('followingLeetCode username');
        
        console.log('🔍 User found:', user ? user.username : 'null');
        
        if (user) {
          console.log('🔍 User followingLeetCode count:', user.followingLeetCode?.length || 0);
          
          // Get directly followed LeetCode users
          const followingLeetcode = user.followingLeetCode || [];
          
          console.log('🔍 Directly followed LeetCode users:', followingLeetcode);
          
          // Use the followed LeetCode users
          leetcodeUsernames = [...followingLeetcode];
          
          // Remove logged-in user's username from the list to avoid fetching twice
          if (user.username) {
            leetcodeUsernames = leetcodeUsernames.filter(username => username !== user.username);
            console.log(`📊 Removed logged-in user's username from external fetch list: ${user.username}`);
          }
          
          console.log(`✅ Found ${leetcodeUsernames.length} LeetCode usernames for user ${user.username}:`, leetcodeUsernames);
        }
      } catch (authError) {
        console.log('❌ Auth error:', authError.message);
        console.log('🔧 Using default users due to auth error');
      }
    } else {
      console.log('🔧 No token provided, using default users');
    }
    
    console.log(`📋 Final leaderboard will fetch data for ${leetcodeUsernames.length} users:`, leetcodeUsernames);

    const { fetchLeetCodeProfile, fetchLeetCodeContestData, fetchRecentSubmissions, calculateProblemsToday } = await import('../utils/leetcodeApi.js');
    
    // Add logged-in user to leaderboard if they have LeetCode profile
    let loggedInUserData = null;
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        
        const User = await import('../models/User.js');
        const loggedInUser = await User.default.findById(decoded.userId);
        
        if (loggedInUser && loggedInUser.username) {
          console.log(`📊 Fetching fresh data for logged-in user: ${loggedInUser.username}`);
          
          try {
            const [leetcodeData, contestData, recentSubmissions] = await Promise.all([
              fetchLeetCodeProfile(loggedInUser.username),
              fetchLeetCodeContestData(loggedInUser.username),
              fetchRecentSubmissions(loggedInUser.username, 100)
            ]);
            
            if (leetcodeData && leetcodeData.solvedStats) {
              const problemsSolvedToday = recentSubmissions && Array.isArray(recentSubmissions)
                ? calculateProblemsToday(recentSubmissions)
                : 0;
              
              loggedInUserData = {
                user: {
                  id: loggedInUser._id.toString(),
                  username: loggedInUser.username,
                  firstName: loggedInUser.profile?.firstName || '',
                  lastName: loggedInUser.profile?.lastName || '',
                  avatar: leetcodeData.profile?.userAvatar || null
                },
                totalSolved: leetcodeData.solvedStats.totalSolved || 0,
                easySolved: leetcodeData.solvedStats.easySolved || 0,
                mediumSolved: leetcodeData.solvedStats.mediumSolved || 0,
                hardSolved: leetcodeData.solvedStats.hardSolved || 0,
                problemsSolvedToday: problemsSolvedToday,
                contestRating: contestData?.rating || null,
                lastFetched: new Date(),
                source: 'platform'
              };
              
              console.log(`✅ Fresh data fetched for logged-in user: ${loggedInUser.username}`);
              console.log(`📊 Avatar: ${leetcodeData.profile?.userAvatar ? 'present' : 'null'}`);
              console.log(`📊 Contest rating: ${contestData?.rating || 'null'}`);
            }
          } catch (error) {
            console.log(`❌ Error fetching LeetCode data for logged-in user: ${error.message}`);
          }
        }
      } catch (error) {
        console.log(`❌ Error processing logged-in user: ${error.message}`);
      }
    }
    
    const externalUsersPromises = leetcodeUsernames.map(async (leetcodeUsername) => {
      try {
        const [leetcodeData, contestData, recentSubmissions] = await Promise.all([
          fetchLeetCodeProfile(leetcodeUsername),
          fetchLeetCodeContestData(leetcodeUsername),
          fetchRecentSubmissions(leetcodeUsername, 100) // Fetch recent submissions for unique problem counting
        ]);
        
        if (leetcodeData && leetcodeData.solvedStats) {
          const totalSolved = leetcodeData.solvedStats.totalSolved || 0;
          
          // Calculate today's problems using recent submissions for unique problem counting
          const problemsSolvedToday = recentSubmissions && Array.isArray(recentSubmissions)
            ? calculateProblemsToday(recentSubmissions)
            : 0;
          
          // Log contest data for debugging
          console.log(`📊 Contest data for ${leetcodeUsername}:`, contestData?.rating ? `${contestData.rating}` : 'null');
          


          return {
            user: {
              id: `leetcode_${leetcodeUsername}`,
              username: leetcodeUsername,
              firstName: leetcodeData.profile?.realName?.split(' ')[0] || '',
              lastName: leetcodeData.profile?.realName?.split(' ').slice(1).join(' ') || '',
              avatar: leetcodeData.profile?.userAvatar || null
            },
            totalSolved: totalSolved,
            easySolved: leetcodeData.solvedStats.easySolved || 0,
            mediumSolved: leetcodeData.solvedStats.mediumSolved || 0,
            hardSolved: leetcodeData.solvedStats.hardSolved || 0,
            problemsSolvedToday: problemsSolvedToday,
            contestRating: contestData?.rating || null,
            lastFetched: new Date(),
            source: 'external'
          };
        }
        return null;
      } catch (error) {
        console.log(`Error fetching external user ${leetcodeUsername}:`, error.message);
        return null;
      }
    });

    const externalUsers = await Promise.all(externalUsersPromises);
    externalUsers.forEach(userData => {
      if (userData) {
        leaderboard.push(userData);
      }
    });
    
    // Add logged-in user to leaderboard if available and not already included
    if (loggedInUserData) {
      // Check if logged-in user is already in the leaderboard (from followingLeetCode)
      const alreadyIncluded = leaderboard.some(user => 
        user.user.id === loggedInUserData.user.id || 
        (user.user.username === loggedInUserData.user.username && user.source === 'external')
      );
      
      if (!alreadyIncluded) {
        leaderboard.push(loggedInUserData);
        console.log(`📊 Added logged-in user to leaderboard: ${loggedInUserData.user.username}`);
      } else {
        console.log(`📊 Logged-in user already in leaderboard, skipping duplicate`);
      }
    }

    // Sort leaderboard by totalSolved (descending) and add ranks
    leaderboard.sort((a, b) => b.totalSolved - a.totalSolved);
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    console.log(`Leaderboard generated with ${rankedLeaderboard.length} entries:`, 
      rankedLeaderboard.map(e => `${e.user.username}: ${e.totalSolved} (${e.source})`));

    res.json({ leaderboard: rankedLeaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
});



export default router; 