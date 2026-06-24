import * as api from './api';
import jwtDecode from 'jwt-decode';

export const signup = async (name, email, password, role = 'buyer') => {
  return api.post('/auth/signup', { name, email, password, confirm_password: password, role });
};

export const login = async (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const refreshToken = async (token) => {
  return api.post('/auth/refresh', { refreshToken: token });
};

export const getCurrentUser = (token) => {
  try {
    return jwtDecode(token);
  } catch {
    throw new Error('Invalid token');
  }
};
