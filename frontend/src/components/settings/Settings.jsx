import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Save, 
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usersAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for shimmer effect
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);


  // Combined form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm();

  useEffect(() => {
    if (user) {
      // Set form values
      setValue('username', user.username || '');
      setValue('firstName', user.profile?.firstName || '');
      setValue('lastName', user.profile?.lastName || '');
    }
  }, [user, setValue]);

  const onFormSubmit = async (data) => {
    try {
      // Extract profile data
      const { username, firstName, lastName } = data;
      
      // Update profile - backend expects flat structure, not nested
      const response = await usersAPI.updateProfile({ 
        username,
        firstName, 
        lastName
      });
      
      updateUser(response.data.user);
      toast.success('Settings updated successfully!');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update settings';
      toast.error(message);
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

          {/* Settings form shimmer */}
          <div className="card">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="space-y-6">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            <div className="flex justify-end mt-6">
              <div className="h-10 w-24 bg-gray-200 rounded"></div>
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
        <p className="text-gray-600">Manage your profile and LeetCode account</p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* Profile Settings */}
        <div className="card">
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Your username ({user?.username}) is automatically used as your LeetCode username.
            </p>
          </div>

          <div className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                {...register('username', {
                  required: 'Username is required'
                })}
                type="text"
                className="input-field"
                placeholder="Your username (used as LeetCode username)"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This username will be used to fetch your LeetCode data. Make sure it matches your LeetCode username.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  {...register('firstName', {
                    maxLength: { value: 50, message: 'First name cannot exceed 50 characters' }
                  })}
                  type="text"
                  className="input-field"
                  placeholder="Your first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  {...register('lastName', {
                    maxLength: { value: 50, message: 'Last name cannot exceed 50 characters' }
                  })}
                  type="text"
                  className="input-field"
                  placeholder="Your last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>


          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button type="submit" className="btn-primary flex items-center px-6 py-3">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings; 