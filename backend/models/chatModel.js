const pool = require('../config/database');

class ChatModel {
  static async createMessage(sender_id, receiver_id, message, ticket_id = null) {
    const query = `
      INSERT INTO chats (sender_id, receiver_id, message, ticket_id)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [sender_id, receiver_id, message, ticket_id]);
    return result.insertId;
  }

  static async getConversation(user1_id, user2_id, limit = 50) {
    const query = `
      SELECT * FROM chats
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY sent_at DESC
      LIMIT ?
    `;
    const [rows] = await pool.execute(query, [user1_id, user2_id, user2_id, user1_id, limit]);
    return rows.reverse(); // Return in ascending order
  }

  static async getUserChats(userId) {
    const query = `
      SELECT DISTINCT
        CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_user_id,
        CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_user_id_dup
      FROM chats
      WHERE sender_id = ? OR receiver_id = ?
      ORDER BY sent_at DESC
    `;
    const [rows] = await pool.execute(query, [userId, userId, userId, userId]);
    const unique = [...new Set(rows.map(r => r.other_user_id))];
    return unique;
  }

  static async markAsRead(sender_id, receiver_id) {
    const query = `
      UPDATE chats 
      SET is_read = TRUE 
      WHERE sender_id = ? AND receiver_id = ?
    `;
    await pool.execute(query, [sender_id, receiver_id]);
  }

  static async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*) as count FROM chats 
      WHERE receiver_id = ? AND is_read = FALSE
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows[0].count;
  }
}

module.exports = ChatModel;
