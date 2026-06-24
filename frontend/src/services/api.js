const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

export const get = (endpoint) => request(endpoint);
export const post = (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) });
export const put = (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) });
export const del = (endpoint) => request(endpoint, { method: 'DELETE' });

export const uploadFile = async (endpoint, formData) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
};
