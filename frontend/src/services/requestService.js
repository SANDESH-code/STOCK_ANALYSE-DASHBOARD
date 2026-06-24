import * as api from './api';

export const createRequest = async (ticket_id, offered_price) => {
  return api.post('/requests', { ticket_id, offered_price });
};

export const getMyRequests = async () => {
  return api.get('/requests/my-requests');
};

export const getReceivedRequests = async () => {
  return api.get('/requests/received');
};

export const updateRequestStatus = async (id, status, rejection_reason) => {
  return api.put(`/requests/${id}`, { status, rejection_reason });
};

export const getRequestById = async (id) => {
  return api.get(`/requests/${id}`);
};
