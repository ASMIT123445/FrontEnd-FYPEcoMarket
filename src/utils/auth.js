// Authentication utility functions

export const isAuthenticated = () => {
  const token = localStorage.getItem('access');
  const refresh = localStorage.getItem('refresh');
  
  if (!token) return false;
  
  try {
    // Check if token is expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // If access token is expired but we have refresh token, still consider authenticated
    // The axios interceptor will handle the refresh
    if (payload.exp < currentTime) {
      return !!refresh; // Return true if we have refresh token
    }
    
    return true;
  } catch (error) {
    console.error('Error checking token:', error);
    return !!refresh; // Fallback to refresh token presence
  }
};

export const isTokenExpired = () => {
  const token = localStorage.getItem('access');
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const getTokenExpiryTime = () => {
  const token = localStorage.getItem('access');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp;
  } catch (error) {
    return null;
  }
};

export const getToken = () => {
  return localStorage.getItem('access');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refresh');
};

export const logout = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  window.location.href = '/login';
};

export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Decode JWT token to get user info
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('JWT payload:', payload); // Debug log
    
    // Return user data from custom JWT claims
    return {
      user_id: payload.user_id,
      username: payload.username,
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};