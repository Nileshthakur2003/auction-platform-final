import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import ApiConnector from '../components/apiconnector';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(Cookies.get('auth_token') || null);
  const [userType, setUserType] = useState(Cookies.get('user_type') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = Cookies.get('auth_token');
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setUserType(null);
        setLoading(false);
        return;
      }

      try {
        const response = await ApiConnector.get('/validate-token');
        setUser(response.data);
        setUserType(String(response.data.userType));
        setToken(storedToken);
      } catch (err) {
        console.error('Failed to validate session token:', err);
        Cookies.remove('auth_token');
        Cookies.remove('user_type');
        setUser(null);
        setToken(null);
        setUserType(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await ApiConnector.post('/signin', { email, password });
      const { token: receivedToken, user: uType, userType: rawType, username } = response.data;

      const normalizedType = rawType !== undefined ? String(rawType) : String(uType);

      Cookies.set('auth_token', receivedToken, { expires: 7, sameSite: 'lax' });
      Cookies.set('user_type', normalizedType, { expires: 7, sameSite: 'lax' });

      setToken(receivedToken);
      setUserType(normalizedType);
      setUser({
        username: username || email,
        email: email,
        userType: normalizedType,
      });

      return {
        success: true,
        userType: normalizedType,
        message: 'Login successful',
      };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const response = await ApiConnector.post('/signup', userData);
      return {
        success: true,
        message: response.data.message || 'Registration successful! Please sign in.',
      };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    Cookies.remove('auth_token');
    Cookies.remove('user_type');
    setUser(null);
    setToken(null);
    setUserType(null);
    window.location.href = '/signin';
  };

  const updateUser = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        userType,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
