import * as api from './api';

export const getProfile = async () => {
  return api.get('/users/profile');
};

export const updateProfile = async (data) => {
  return api.put('/users/profile', data);
};

export const getUserById = async (id) => {
  return api.get(`/users/${id}`);
};

export const getUserRatings = async (userId) => {
  return api.get(`/users/${userId}/ratings`);
};

export const getAllUsers = async () => {
  return api.get('/users');
};
