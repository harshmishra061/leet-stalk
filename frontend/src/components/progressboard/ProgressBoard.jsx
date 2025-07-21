import React, { useState, useEffect } from 'react';
import { 
  Users,
  ExternalLink,
  Activity
} from 'lucide-react';
import { usersAPI } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const ProgressBoard = () => {
  const { user: currentUser } = useAuth();
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('totalSolved');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'

  useEffect(() => {
    fetchProgressBoard();
  }, []);

  const fetchProgressBoard = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getProgressBoard();
      setProgressData(response.data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching progress board:', error);
      toast.error('Failed to load progress board');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      // New column, default to descending
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const sortedData = [...progressData].sort((a, b) => {
    let aValue = a[sortBy] || 0;
    let bValue = b[sortBy] || 0;
    
    // Special handling for contest rating (can be null)
    if (sortBy === 'contestRating') {
      aValue = a.contestRating || 0;
      bValue = b.contestRating || 0;
    }
    
    // Apply sort direction
    if (sortDirection === 'desc') {
      return bValue - aValue; // Descending order
    } else {
      return aValue - bValue; // Ascending order
    }
  });

  const getSortIcon = (column) => {
    if (sortBy !== column) return '';
    return sortDirection === 'desc' ? '↓' : '↑';
  };

  const getRatingStyle = (rating) => {
    if (!rating) return 'text-gray-400';
    
    if (rating >= 2400) return 'text-red-600 font-bold'; // Grandmaster
    if (rating >= 2300) return 'text-orange-500 font-bold'; // Master
    if (rating >= 2100) return 'text-purple-600 font-bold'; // Candidate Master
    if (rating >= 1900) return 'text-blue-600 font-bold'; // Expert
    if (rating >= 1600) return 'text-cyan-600 font-bold'; // Specialist
    if (rating >= 1400) return 'text-green-600 font-bold'; // Pupil
    return 'text-gray-600 font-semibold'; // Newbie
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6">
        <div className="animate-pulse">
          {/* Header shimmer */}
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>

          {/* Table shimmer */}
          <div className="card">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-gray-600">
          Track daily problem-solving progress.
        </p>
        <p className="mt-2 text-sm text-blue-600 font-medium">
          Click column headers to sort
        </p>
      </div>



      {/* Progress Board Table */}
      <div className="card">


        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${sortBy === 'totalSolved' ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
                  onClick={() => handleSort('totalSolved')}
                >
                  Total Solved {getSortIcon('totalSolved')}
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${sortBy === 'problemsSolvedToday' ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
                  onClick={() => handleSort('problemsSolvedToday')}
                >
                  Today {getSortIcon('problemsSolvedToday')}
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${sortBy === 'easySolved' ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
                  onClick={() => handleSort('easySolved')}
                >
                  Easy {getSortIcon('easySolved')}
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${sortBy === 'mediumSolved' ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
                  onClick={() => handleSort('mediumSolved')}
                >
                  Medium {getSortIcon('mediumSolved')}
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${sortBy === 'hardSolved' ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
                  onClick={() => handleSort('hardSolved')}
                >
                  Hard {getSortIcon('hardSolved')}
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${sortBy === 'contestRating' ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
                  onClick={() => handleSort('contestRating')}
                >
                  Rating {getSortIcon('contestRating')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((user) => {
                const isCurrentUser = user.source === 'platform' && user.user.id === currentUser?.id;
                return (
                <tr key={user.user.id} className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.user.avatar ? (
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={user.user.avatar} 
                            alt={user.user.username}
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center ${user.user.avatar ? 'hidden' : ''}`}
                        >
                          <span className="text-sm font-medium text-white">
                            {user.user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            {user.user.username}
                          </div>
                          {isCurrentUser && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              You
                            </span>
                          )}
                          {!isCurrentUser && (
                            <a
                              href={`https://leetcode.com/${user.user.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          <span>{user.user.firstName} {user.user.lastName}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.totalSolved}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-blue-600">
                      {user.problemsSolvedToday}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-600">
                      {user.easySolved}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-yellow-600">
                      {user.mediumSolved}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-red-600">
                      {user.hardSolved}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {user.contestRating ? (
                        <span className={`text-sm ${getRatingStyle(user.contestRating)}`}>
                          {Math.round(user.contestRating)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          —
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>

          {sortedData.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No data available
              </h3>
              <p className="text-gray-500">
                No progress data found for today.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBoard; 