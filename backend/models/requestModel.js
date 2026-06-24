const pool = require('../config/database');

class RequestModel {
  static async create(ticket_id, buyer_id, seller_id, offered_price) {
    const query = `
      INSERT INTO requests (ticket_id, buyer_id, seller_id, offered_price)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [ticket_id, buyer_id, seller_id, offered_price]);
    return result.insertId;
  }

  static async getById(id) {
    const query = `
      SELECT r.*, t.event_name, t.selling_price,
             b.name as buyer_name, s.name as seller_name
      FROM requests r
      JOIN tickets t ON r.ticket_id = t.id
      JOIN users b ON r.buyer_id = b.id
      JOIN users s ON r.seller_id = s.id
      WHERE r.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  static async getBuyerRequests(buyerId) {
    const query = `
      SELECT r.*, t.event_name, t.event_date, t.selling_price,
             s.name as seller_name
      FROM requests r
      JOIN tickets t ON r.ticket_id = t.id
      JOIN users s ON r.seller_id = s.id
      WHERE r.buyer_id = ?
      ORDER BY r.request_date DESC
    `;
    const [rows] = await pool.execute(query, [buyerId]);
    return rows;
  }

  static async getSellerRequests(sellerId) {
    const query = `
      SELECT r.*, t.event_name, t.event_date, t.selling_price,
             b.name as buyer_name
      FROM requests r
      JOIN tickets t ON r.ticket_id = t.id
      JOIN users b ON r.buyer_id = b.id
      WHERE r.seller_id = ? AND r.status = 'Pending'
      ORDER BY r.request_date DESC
    `;
    const [rows] = await pool.execute(query, [sellerId]);
    return rows;
  }

  static async updateStatus(id, status, rejection_reason = null) {
    const query = `
      UPDATE requests 
      SET status = ?, rejection_reason = ?, responded_at = NOW()
      WHERE id = ?
    `;
    await pool.execute(query, [status, rejection_reason, id]);
  }

  static async getPendingCount(sellerId) {
    const query = 'SELECT COUNT(*) as count FROM requests WHERE seller_id = ? AND status = "Pending"';
    const [rows] = await pool.execute(query, [sellerId]);
    return rows[0].count;
  }
}

module.exports = RequestModel;
