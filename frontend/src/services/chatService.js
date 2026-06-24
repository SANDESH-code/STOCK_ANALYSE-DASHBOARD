import * as api from './api';

export const sendMessage = async (receiver_id, message, ticket_id = null) => {
  return api.post('/chats/send', { receiver_id, message, ticket_id });
};

export const getConversation = async (userId) => {
  return api.get(`/chats/conversation/${userId}`);
};

export const getUserChats = async () => {
  return api.get('/chats/list');
};

export const markAsRead = async (sender_id) => {
  return api.put('/chats/read', { sender_id });
};

export const getUnreadCount = async () => {
  return api.get('/chats/unread');
};
