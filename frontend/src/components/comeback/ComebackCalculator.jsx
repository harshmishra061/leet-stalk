import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Users,
  Target,
  Calendar
} from 'lucide-react';
import { friendsAPI, leetcodeAPI } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const ComebackCalculator = () => {
  const { user: currentUser } = useAuth();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Daily targets
  const [easyPerDay, setEasyPerDay] = useState(0);
  const [mediumPerDay, setMediumPerDay] = useState(0);
  const [hardPerDay, setHardPerDay] = useState(0);

  // Calculated values
  const [daysNeeded, setDaysNeeded] = useState(null);
  const [breakdown, setBreakdown] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedFriend && userProfile) {
      calculateDays();
    }
  }, [selectedFriend, userProfile, easyPerDay, mediumPerDay, hardPerDay]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's own profile
      const profileResponse = await leetcodeAPI.getProfile();
      setUserProfile(profileResponse.data.profile);

      // Fetch friends list
      const friendsResponse = await friendsAPI.getFollowing();
      const friendsList = friendsResponse.data.following || [];
      setFriends(friendsList);

      // Select first friend by default if available
      if (friendsList.length > 0) {
        setSelectedFriend(friendsList[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!selectedFriend || !userProfile) return;

    const userEasy = userProfile.profileData?.easySolved || 0;
    const userMedium = userProfile.profileData?.mediumSolved || 0;
    const userHard = userProfile.profileData?.hardSolved || 0;

    const friendEasy = selectedFriend.easySolved || 0;
    const friendMedium = selectedFriend.mediumSolved || 0;
    const friendHard = selectedFriend.hardSolved || 0;

    const easyDiff = Math.max(0, friendEasy - userEasy);
    const mediumDiff = Math.max(0, friendMedium - userMedium);
    const hardDiff = Math.max(0, friendHard - userHard);

    // If all daily targets are 0 and there's a difference, can't calculate
    if (easyPerDay === 0 && mediumPerDay === 0 && hardPerDay === 0) {
      if (easyDiff > 0 || mediumDiff > 0 || hardDiff > 0) {
        setDaysNeeded(Infinity);
        setBreakdown(null);
        return;
      }
    }

    // Calculate days needed for each difficulty
    const easyDays = easyPerDay > 0 && easyDiff > 0 ? Math.ceil(easyDiff / easyPerDay) : 0;
    const mediumDays = mediumPerDay > 0 && mediumDiff > 0 ? Math.ceil(mediumDiff / mediumPerDay) : 0;
    const hardDays = hardPerDay > 0 && hardDiff > 0 ? Math.ceil(hardDiff / hardPerDay) : 0;

    // If there's a difference but no daily target for that category, set to infinity
    if ((easyDiff > 0 && easyPerDay === 0) || 
        (mediumDiff > 0 && mediumPerDay === 0) || 
        (hardDiff > 0 && hardPerDay === 0)) {
      setDaysNeeded(Infinity);
      setBreakdown(null);
      return;
    }

    // Maximum days needed
    const maxDays = Math.max(easyDays, mediumDays, hardDays);

    setDaysNeeded(maxDays);
    setBreakdown({
      easy: { diff: easyDiff, days: easyDays },
      medium: { diff: mediumDiff, days: mediumDays },
      hard: { diff: hardDiff, days: hardDays },
    });
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="card mb-6">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="px-4 sm:px-6">
        <div className="card">
          <div className="text-center py-12">
            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No LeetCode Profile Found
            </h3>
            <p className="text-gray-600">
              Please set up your LeetCode profile in Settings to use this feature.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="px-4 sm:px-6">
        <div className="card">
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Friends Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Add friends to compare your progress and calculate comeback time!
            </p>
            <a href="/friends" className="btn-primary">
              Add Friends
            </a>
          </div>
        </div>
      </div>
    );
  }

  const userStats = {
    easy: userProfile.profileData?.easySolved || 0,
    medium: userProfile.profileData?.mediumSolved || 0,
    hard: userProfile.profileData?.hardSolved || 0,
    total: userProfile.profileData?.totalSolved || 0,
  };

  const friendStats = selectedFriend ? {
    easy: selectedFriend.easySolved || 0,
    medium: selectedFriend.mediumSolved || 0,
    hard: selectedFriend.hardSolved || 0,
    total: selectedFriend.totalSolved || 0,
  } : null;

  // Check if user is behind in any category
  const isBehindInAnyCategory = selectedFriend && userProfile ? (
    (selectedFriend.easySolved || 0) > (userProfile.profileData?.easySolved || 0) ||
    (selectedFriend.mediumSolved || 0) > (userProfile.profileData?.mediumSolved || 0) ||
    (selectedFriend.hardSolved || 0) > (userProfile.profileData?.hardSolved || 0)
  ) : false;

  return (
    <div className="px-4 sm:px-6">
      {/* Friend Selection */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Friend to Compare</h2>
        <select
          value={selectedFriend?.username || ''}
          onChange={(e) => {
            const friend = friends.find(f => f.username === e.target.value);
            setSelectedFriend(friend);
            // Reset daily targets to 0 when selecting a new friend
            setEasyPerDay(0);
            setMediumPerDay(0);
            setHardPerDay(0);
          }}
          className="input-field"
        >
          {friends.map((friend) => (
            <option key={friend.username} value={friend.username}>
              {friend.username}
            </option>
          ))}
        </select>
      </div>

      {/* Current Stats Comparison */}
      {selectedFriend && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Your Stats */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Your Stats ({currentUser?.username})
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Solved:</span>
                <span className="font-bold text-blue-900">{userStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-600">Easy:</span>
                <span className="font-semibold text-green-700">{userStats.easy}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-600">Medium:</span>
                <span className="font-semibold text-yellow-700">{userStats.medium}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600">Hard:</span>
                <span className="font-semibold text-red-700">{userStats.hard}</span>
              </div>
            </div>
          </div>

          {/* Friend's Stats */}
          <div className="card bg-purple-50 border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">
              {selectedFriend.username}'s Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Solved:</span>
                <span className="font-bold text-purple-900">{friendStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-600">Easy:</span>
                <span className="font-semibold text-green-700">{friendStats.easy}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-600">Medium:</span>
                <span className="font-semibold text-yellow-700">{friendStats.medium}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600">Hard:</span>
                <span className="font-semibold text-red-700">{friendStats.hard}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Target Input - Only show if user is behind */}
      {isBehindInAnyCategory && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary-600" />
            Set Your Daily Targets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Easy Problems Per Day
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEasyPerDay(Math.max(0, easyPerDay - 1))}
                className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={easyPerDay <= 0}
              >
                −
              </button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-bold text-gray-900">{easyPerDay}</span>
              </div>
              <button
                onClick={() => setEasyPerDay(easyPerDay + 1)}
                className="w-10 h-10 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-lg transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medium Problems Per Day
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMediumPerDay(Math.max(0, mediumPerDay - 1))}
                className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={mediumPerDay <= 0}
              >
                −
              </button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-bold text-gray-900">{mediumPerDay}</span>
              </div>
              <button
                onClick={() => setMediumPerDay(mediumPerDay + 1)}
                className="w-10 h-10 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-lg transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hard Problems Per Day
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHardPerDay(Math.max(0, hardPerDay - 1))}
                className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={hardPerDay <= 0}
              >
                −
              </button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-bold text-gray-900">{hardPerDay}</span>
              </div>
              <button
                onClick={() => setHardPerDay(hardPerDay + 1)}
                className="w-10 h-10 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-lg transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Bottleneck Hint */}
        {breakdown && (easyPerDay > 0 || mediumPerDay > 0 || hardPerDay > 0) && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">
              💡 Quick Tip:
            </p>
            <div className="text-sm text-blue-800">
              {(() => {
                const bottlenecks = [];
                if (breakdown.easy.days === daysNeeded && daysNeeded > 0) bottlenecks.push({ type: 'Easy', days: breakdown.easy.days });
                if (breakdown.medium.days === daysNeeded && daysNeeded > 0) bottlenecks.push({ type: 'Medium', days: breakdown.medium.days });
                if (breakdown.hard.days === daysNeeded && daysNeeded > 0) bottlenecks.push({ type: 'Hard', days: breakdown.hard.days });

                if (bottlenecks.length === 0) {
                  return <p>You're all set! No problems to catch up on.</p>;
                } else if (bottlenecks.length === 1) {
                  return (
                    <>
                      <p>Focus on {bottlenecks[0].type} problems - they're your bottleneck ({bottlenecks[0].days} days needed).</p>
                      <p className="mt-1">Increase your daily target for faster comeback!</p>
                    </>
                  );
                } else {
                  const types = bottlenecks.map(b => b.type).join(', ');
                  return (
                    <>
                      <p>Focus on {types} problems - they're tied for your bottleneck ({bottlenecks[0].days} days each).</p>
                      <p className="mt-1">Increase your daily targets for faster comeback!</p>
                    </>
                  );
                }
              })()}
            </div>
          </div>
        )}
        </div>
      )}

      {/* Results */}
      {daysNeeded !== null && breakdown && (
        <div className="card bg-gradient-to-br from-primary-50 to-purple-50 border-primary-200">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-primary-600 mx-auto mb-3" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {daysNeeded === Infinity ? (
                <span className="text-red-600">Cannot Calculate ⚠️</span>
              ) : daysNeeded === 0 ? (
                <span className="text-green-600">You're Already Ahead! 🎉</span>
              ) : (
                <span>{daysNeeded} Days</span>
              )}
            </h2>
            <p className="text-gray-600">
              {daysNeeded === Infinity
                ? 'Set your daily targets above 0 to calculate comeback time'
                : daysNeeded === 0 
                  ? `You've solved more problems than ${selectedFriend.username}!`
                  : `to catch up with ${selectedFriend.username} at this pace`
              }
            </p>
          </div>
        </div>
      )}
      
      {daysNeeded === Infinity && (
        <div className="card bg-gradient-to-br from-primary-50 to-purple-50 border-primary-200">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-primary-600 mx-auto mb-3" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              <span className="text-red-600">Cannot Calculate ⚠️</span>
            </h2>
            <p className="text-gray-600">
              Set your daily targets above 0 to calculate comeback time
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComebackCalculator;

