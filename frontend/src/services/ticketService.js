import * as api from './api';

export const getAllTickets = async (filters) => {
  const query = new URLSearchParams(filters).toString();
  return api.get(`/tickets?${query}`);
};

export const getTicketById = async (id) => {
  return api.get(`/tickets/${id}`);
};

export const createTicket = async (ticketData, imageFile) => {
  const formData = new FormData();
  Object.keys(ticketData).forEach(key => {
    formData.append(key, ticketData[key]);
  });
  if (imageFile) {
    formData.append('image', imageFile);
  }
  return api.uploadFile('/tickets', formData);
};

export const getSellerTickets = async () => {
  return api.get('/tickets/seller/tickets');
};

export const deleteTicket = async (id) => {
  return api.del(`/tickets/${id}`);
};

export const getDashboardStats = async () => {
  return api.get('/tickets/stats');
};
