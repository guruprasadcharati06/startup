import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import * as authApi from '../api/auth.js';

const AuthContext = createContext();

const TOKEN_KEY = 'lsapp_token';
const USER_KEY = 'lsapp_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const applyAuthSuccess = (res) => {
    if (res?.user && res?.token) {
      setUser(res.user);
      setToken(res.token);
    }
    return res;
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authApi.login(credentials);
      return applyAuthSuccess(res);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload) => {
    setLoading(true);
    try {
      const res = await authApi.signup(payload);
      return applyAuthSuccess(res);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (payload) => {
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(payload);
      return applyAuthSuccess(res);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (payload) => {
    return authApi.resendOtp(payload);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      authLoading: loading,
      login,
      signup,
      logout,
      verifyOtp,
      resendOtp,
      setUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
