const ChatModel = require('../models/chatModel');

class ChatController {
  static async sendMessage(req, res) {
    try {
      const { receiver_id, message, ticket_id } = req.body;

      if (!receiver_id || !message) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const messageId = await ChatModel.createMessage(req.userId, receiver_id, message, ticket_id);

      res.status(201).json({
        message: 'Message sent',
        messageId
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getConversation(req, res) {
    try {
      const { userId } = req.params;
      const messages = await ChatModel.getConversation(req.userId, parseInt(userId));

      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getUserChats(req, res) {
    try {
      const chats = await ChatModel.getUserChats(req.userId);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async markAsRead(req, res) {
    try {
      const { sender_id } = req.body;

      if (!sender_id) {
        return res.status(400).json({ message: 'Sender ID required' });
      }

      await ChatModel.markAsRead(sender_id, req.userId);

      res.json({ message: 'Marked as read' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getUnreadCount(req, res) {
    try {
      const count = await ChatModel.getUnreadCount(req.userId);
      res.json({ unread_count: count });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = ChatController;
