// Utility functions for managing user sessions and cached data

/**
 * Cache user profile data for offline viewing
 * @param {Object} userData - User profile data to cache
 */
export const cacheUserProfile = (userData) => {
  try {
    localStorage.setItem('cachedUserProfile', JSON.stringify(userData));
    console.log('User profile cached successfully');
  } catch (error) {
    console.error('Error caching user profile:', error);
  }
};

/**
 * Cache user enrollments data for offline viewing
 * @param {Array} enrollmentsData - User enrollments data to cache
 */
export const cacheUserEnrollments = (enrollmentsData) => {
  try {
    localStorage.setItem('cachedUserEnrollments', JSON.stringify(enrollmentsData));
    console.log('User enrollments cached successfully');
  } catch (error) {
    console.error('Error caching user enrollments:', error);
  }
};

/**
 * Get cached user profile data
 * @returns {Object|null} Cached user profile data or null if not found
 */
export const getCachedUserProfile = () => {
  try {
    const cachedData = localStorage.getItem('cachedUserProfile');
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error getting cached user profile:', error);
    return null;
  }
};

/**
 * Get cached user enrollments data
 * @returns {Array|null} Cached user enrollments data or null if not found
 */
export const getCachedUserEnrollments = () => {
  try {
    const cachedData = localStorage.getItem('cachedUserEnrollments');
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error getting cached user enrollments:', error);
    return null;
  }
};

/**
 * Check if user is currently logged in
 * @returns {boolean} True if user is logged in, false otherwise
 */
export const isUserLoggedIn = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return false;
    
    const parsedUserInfo = JSON.parse(userInfo);
    return !!(parsedUserInfo && parsedUserInfo.token);
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

/**
 * Clear all cached data (use when user wants to completely clear their data)
 */
export const clearAllCachedData = () => {
  try {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('cachedUserProfile');
    localStorage.removeItem('cachedUserEnrollments');
    console.log('All cached data cleared');
  } catch (error) {
    console.error('Error clearing cached data:', error);
  }
};

/**
 * Clear only authentication data but keep cached profile data
 */
export const clearAuthenticationOnly = () => {
  try {
    localStorage.removeItem('userInfo');
    console.log('Authentication data cleared, cached profile data preserved');
  } catch (error) {
    console.error('Error clearing authentication data:', error);
  }
};

/**
 * Get current user info from localStorage
 * @returns {Object|null} Current user info or null if not found
 */
export const getCurrentUserInfo = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('Error getting current user info:', error);
    return null;
  }
};
