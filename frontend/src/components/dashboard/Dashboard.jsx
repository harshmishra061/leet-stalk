import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, 
  Users, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { leetcodeAPI, usersAPI, globalStatsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [leetcodeProfile, setLeetcodeProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [globalStats, setGlobalStats] = useState({ visitors: 0, likes: 0, dislikes: 0 });



  useEffect(() => {
    // Fetch dashboard data on mount and when username changes
    fetchDashboardData();
    // Load leaderboard separately to avoid blocking main dashboard
    fetchLeaderboardData();
    // Increment visitor count and fetch global stats on page load
    incrementVisitorCount();
  }, [user?.username]);

  useEffect(() => {
    // Auto-refresh every 5 minutes when user has username but no profile data
    let intervalId;
    if (user?.username && !leetcodeProfile && !loading) {
      console.log('🔄 Setting up auto-refresh for missing profile data');
      intervalId = setInterval(() => {
        console.log('🔄 Auto-refreshing dashboard data...');
        fetchDashboardData();
      }, 300000); // 5 minutes
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user?.username, leetcodeProfile, loading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Starting dashboard fetch for user:', user?.username);

      // Only fetch LeetCode profile - no leaderboard here
      if (user?.username) {
        console.log('🔄 Fetching LeetCode profile for:', user.username);
        try {
          const response = await leetcodeAPI.getProfile();
          console.log('🔄 LeetCode profile response:', response);
          console.log('🔄 Setting profile data:', response.data.profile);
          setLeetcodeProfile(response.data.profile);
        } catch (error) {
          console.log('❌ LeetCode profile fetch failed:', error);
          if (error.response?.status === 404) {
            console.log('📝 No stored profile found - user needs to fetch data first');
          }
        }
      } else {
        console.log('⚠️ No username found for user');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // If LeetCode profile fetch fails, user might need to fetch data first
      if (error.response?.status === 404 && user?.username) {
        console.log('LeetCode profile not found, user may need to refresh data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboardData = async () => {
    try {
      setLeaderboardLoading(true);
      console.log('🔄 Fetching leaderboard data...');
      
      const response = await usersAPI.getProgressBoard();
      setLeaderboard(response.data.leaderboard.slice(0, 5));
      
      console.log('✅ Leaderboard data loaded');
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      // Don't show error to user for leaderboard - it's not critical
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const incrementVisitorCount = async () => {
    try {
      const response = await globalStatsAPI.incrementVisitor();
      setGlobalStats(response.data);
    } catch (error) {
      console.error('Error incrementing visitor count:', error);
    }
  };

  const handleGlobalLike = async () => {
    try {
      const response = await globalStatsAPI.incrementLike();
      setGlobalStats(response.data);
      toast.success('Liked! 👍');
    } catch (error) {
      console.error('Error incrementing like:', error);
      toast.error('Failed to like');
    }
  };

  const handleGlobalDislike = async () => {
    try {
      const response = await globalStatsAPI.incrementDislike();
      setGlobalStats(response.data);
      toast.success('Disliked! 👎');
    } catch (error) {
      console.error('Error incrementing dislike:', error);
      toast.error('Failed to dislike');
    }
  };





  if (loading) {
    return (
      <div className="px-4 sm:px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const stats = leetcodeProfile ? [
    {
      name: 'Solved Today',
      value: leetcodeProfile.profileData?.problemsSolvedToday || 0,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Total Solved',
      value: leetcodeProfile.profileData?.totalSolved || 0,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ] : [];

  // Debug logging for leetcodeProfile
  console.log('📊 Current leetcodeProfile:', leetcodeProfile);
  console.log('📊 Problems solved today:', leetcodeProfile?.profileData?.problemsSolvedToday);

  return (
    <div className="px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600">
          Here's your LeetCode progress overview
        </p>
      </div>

      {/* No setup needed - username is automatically used as LeetCode username */}

      {/* LeetCode Profile Data Missing */}
      {user?.username && !leetcodeProfile && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <RefreshCw className="h-8 w-8 text-yellow-600 mr-3" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-yellow-900">
                Loading your LeetCode data...
              </h3>
              <p className="text-yellow-700 mt-1">
                Using your username (<strong>{user.username}</strong>) to fetch LeetCode data automatically.
              </p>
              <p className="text-yellow-600 text-sm mt-2">
                If this takes too long please check and update your username in the settings page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {leetcodeProfile && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="stat-card">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Board */}
      <div className="mb-8">
        <div className="card">
          <div className="flex items-center justify-end mb-4">
            <Link
              to="/progress-board"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View All →
            </Link>
          </div>

          {leaderboardLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
              <div className="text-center py-2">
                <p className="text-sm text-gray-500">Loading leaderboard...</p>
              </div>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((friend) => (
                <div key={friend.user.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-8 w-8">
                    {friend.user.avatar ? (
                      <img 
                        className="h-8 w-8 rounded-full object-cover" 
                        src={friend.user.avatar} 
                        alt={friend.user.username}
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ${friend.user.avatar ? 'hidden' : ''}`}
                    >
                      <span className="text-xs font-medium text-white">
                        {friend.user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {friend.user.username}
                      </p>
                      <p className="text-sm text-gray-500">{friend.user.firstName} {friend.user.lastName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary-600">{friend.problemsSolvedToday || 0} today</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Friends Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Add friends to see who's solving the most problems!
              </p>
              <Link to="/friends" className="btn-primary">
                Find Friends
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Global Stats - Simple Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Visitor Count */}
        <div className="p-4 bg-blue-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <Eye className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Visitors</p>
              <p className="text-2xl font-bold text-gray-900">{globalStats.visitors}</p>
            </div>
          </div>
        </div>

        {/* Likes */}
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Likes</p>
              <p className="text-xl font-bold text-green-600">{globalStats.likes}</p>
            </div>
            <button
              onClick={handleGlobalLike}
              className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              title="Like"
              aria-label="Like this dashboard"
            >
              <ThumbsUp className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Dislikes */}
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Dislikes</p>
              <p className="text-xl font-bold text-red-600">{globalStats.dislikes}</p>
            </div>
            <button
              onClick={handleGlobalDislike}
              className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              title="Dislike"
              aria-label="Dislike this dashboard"
            >
              <ThumbsDown className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard; 