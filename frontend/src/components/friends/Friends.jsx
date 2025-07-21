import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Code,
  Plus,
  X
} from 'lucide-react';
import { friendsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const [hasSearched, setHasSearched] = useState(false);



  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await friendsAPI.getFollowing();
      console.log('Following API response:', response.data);
      setFriends(response.data.following || []);
    } catch (error) {
      console.error('Error fetching following list:', error);
      toast.error('Failed to load following list');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query = searchQuery) => {
    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length < 1) {
      if (trimmedQuery.length === 0) {
        setSearchResults([]);
        setHasSearched(false);
      } else {
        toast.error('Please enter at least 1 character to search');
      }
      return;
    }

    try {
      setSearching(true);
      setHasSearched(true);
      const response = await friendsAPI.searchLeetCodeUser(trimmedQuery);
      console.log('Search API response:', response.data);
      if (response.data.user) {
        setSearchResults([response.data.user]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      // Don't show toast error for search failures - let UI message handle it
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Handle Enter key press for search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // Handle search button click
  const handleSearchClick = () => {
    handleSearch();
  };

  // Clear search results when input is cleared
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim() === '') {
      setSearchResults([]);
      setHasSearched(false);
    } else if (hasSearched) {
      // Reset hasSearched when user starts typing again after a search
      setHasSearched(false);
    }
  };

  const handleAddFriend = async (username) => {
    try {
      await friendsAPI.followLeetCodeUser(username);
      toast.success(`Started following ${username}!`);
      // Refresh friends list
      fetchFriends();
      // Clear search results and reset search state
      setSearchResults([]);
      setSearchQuery('');
      setHasSearched(false);
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to follow user';
      toast.error(message);
    }
  };



  const handleRemoveFriend = async (username) => {
    if (!confirm(`Stop following ${username}?`)) {
      return;
    }

    try {
      await friendsAPI.unfollowLeetCodeUser(username);
      toast.success(`Stopped following ${username}`);
      fetchFriends();
    } catch {
      toast.error('Failed to unfollow user');
    }
  };



  if (loading) {
    return (
      <div className="px-4 sm:px-6">
        <div className="animate-pulse">
          {/* Header shimmer */}
          <div className="mb-8">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>

          {/* Search section shimmer */}
          <div className="card mb-8">
            <div className="flex gap-3 mb-4">
              <div className="flex-1 h-12 bg-gray-200 rounded"></div>
              <div className="w-24 h-12 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Friends list shimmer */}
          <div className="card">
            <div className="flex items-center justify-end mb-6">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-600">Follow friends by their LeetCode username to track their progress</p>
      </div>

      {/* Search Section */}
      <div className="card mb-8">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="LeetCode username"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="input-field h-12"
              disabled={searching}
            />
          </div>
          <button
            onClick={handleSearchClick}
            disabled={searching || searchQuery.trim().length < 1}
            className="px-4 sm:px-6 h-12 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 transition-colors font-medium min-w-[60px] sm:min-w-auto"
          >
            {searching ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span className="hidden sm:inline">Searching...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
                <span className="sm:hidden">Go</span>
              </>
            )}
          </button>
        </div>



        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Search Results:</h3>
            {searchResults.map((searchUser) => {
              const isAlreadyFollowing = friends.some(f => f.username === searchUser.username);

              return (
                <div key={searchUser.username} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                        {searchUser.avatar ? (
                          <img 
                            src={searchUser.avatar} 
                            alt={searchUser.username}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <Code className="h-6 w-6 text-blue-600" style={{ display: searchUser.avatar ? 'none' : 'flex' }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {searchUser.username}
                        </h3>
                        {searchUser.realName && (
                          <div className="text-sm text-gray-600 mt-1">
                            {searchUser.realName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      {isAlreadyFollowing ? (
                        <span className="text-sm text-green-600 font-medium">Following</span>
                      ) : (
                        <button
                          onClick={() => handleAddFriend(searchUser.username)}
                          className="btn-primary text-sm py-2 px-4 flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Follow
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasSearched && searchQuery.length >= 1 && !searching && searchResults.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No LeetCode users found for "{searchQuery}"</p>
            <p className="text-sm text-gray-400 mt-1">Try a different username or check the spelling</p>
          </div>
        )}
      </div>

      {/* Friends List */}
      <div className="card">
        <div className="flex items-center justify-end mb-6">
          <span className="text-sm text-gray-600">Following ({friends.length})</span>
        </div>

        {friends.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Not Following Anyone Yet</h3>
            <p className="text-gray-600 mb-4">
              Start following LeetCode users by searching for their usernames above!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div key={friend.username} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    {friend.avatar ? (
                      <img 
                        src={friend.avatar} 
                        alt={friend.username}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <Code className="h-4 w-4 text-blue-600" style={{ display: friend.avatar ? 'none' : 'flex' }} />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">
                      {friend.username}
                    </span>
                    {friend.totalSolved !== undefined && (
                      <div className="text-xs text-gray-500">
                        {friend.totalSolved} problems solved
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFriend(friend.username)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Unfollow user"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
};

export default Friends; 