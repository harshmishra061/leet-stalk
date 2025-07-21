import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, 
  Users, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { leetcodeAPI, usersAPI } from '../../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [leetcodeProfile, setLeetcodeProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    // Fetch dashboard data on mount and when username changes
    fetchDashboardData();
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
      let promises = [];

      // Fetch LeetCode profile if user has one
      if (user?.username) {
        console.log('🔄 Fetching LeetCode profile for:', user.username);
        promises.push(leetcodeAPI.getProfile());
      } else {
        console.log('⚠️ No username found for user');
      }

      // Fetch progress board
      promises.push(usersAPI.getProgressBoard());

      const results = await Promise.allSettled(promises);
      
      console.log('🔄 Dashboard fetch results:', results);
      
      if (user?.username && results[0]?.status === 'fulfilled') {
        console.log('🔄 LeetCode profile response:', results[0].value);
        console.log('🔄 Setting profile data:', results[0].value.data.profile);
        setLeetcodeProfile(results[0].value.data.profile);
      } else if (user?.username && results[0]?.status === 'rejected') {
        console.log('❌ LeetCode profile fetch failed:', results[0].reason);
        if (results[0].reason?.response?.status === 404) {
          console.log('📝 No stored profile found - user needs to fetch data first');
        }
      }

      const leaderboardIndex = user?.username ? 1 : 0;
      if (results[leaderboardIndex]?.status === 'fulfilled') {
        setLeaderboard(results[leaderboardIndex].value.data.leaderboard.slice(0, 5));
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

          {leaderboard.length > 0 ? (
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




    </div>
  );
};

export default Dashboard; 