const pool = require('../config/database');

class TicketModel {
  static async create(ticketData) {
    const {
      ticket_code, event_name, event_type, event_date, event_location,
      seat_number, seat_row, original_price, selling_price, suggested_price,
      image_path, seller_id, quantity, description
    } = ticketData;

    const query = `
      INSERT INTO tickets 
      (ticket_code, event_name, event_type, event_date, event_location, seat_number, 
       seat_row, original_price, selling_price, suggested_price, image_path, 
       seller_id, quantity, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      ticket_code, event_name, event_type, event_date, event_location,
      seat_number, seat_row, original_price, selling_price, suggested_price,
      image_path, seller_id, quantity, description
    ]);

    return result.insertId;
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT t.*, u.name as seller_name, u.profile_image as seller_image,
             AVG(r.rating) as seller_rating
      FROM tickets t
      JOIN users u ON t.seller_id = u.id
      LEFT JOIN ratings r ON u.id = r.seller_id
      WHERE t.status = 'Available' AND t.event_date > NOW()
    `;

    const params = [];

    if (filters.event_type) {
      query += ' AND t.event_type = ?';
      params.push(filters.event_type);
    }

    if (filters.min_price) {
      query += ' AND t.selling_price >= ?';
      params.push(filters.min_price);
    }

    if (filters.max_price) {
      query += ' AND t.selling_price <= ?';
      params.push(filters.max_price);
    }

    if (filters.search) {
      query += ' AND t.event_name LIKE ?';
      params.push(`%${filters.search}%`);
    }

    query += ' GROUP BY t.id ORDER BY t.heat_score DESC, t.created_at DESC LIMIT 50';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getById(id) {
    const query = `
      SELECT t.*, u.name as seller_name, u.email as seller_email,
             s.is_verified as seller_verified, s.trust_score,
             AVG(r.rating) as seller_rating
      FROM tickets t
      JOIN users u ON t.seller_id = u.id
      LEFT JOIN sellers s ON u.id = s.user_id
      LEFT JOIN ratings r ON u.id = r.seller_id
      WHERE t.id = ?
      GROUP BY t.id
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE tickets SET status = ? WHERE id = ?';
    await pool.execute(query, [status, id]);
  }

  static async updateHeatScore(id, score) {
    const query = 'UPDATE tickets SET heat_score = ? WHERE id = ?';
    await pool.execute(query, [score, id]);
  }

  static async getSellerTickets(sellerId) {
    const query = `
      SELECT * FROM tickets 
      WHERE seller_id = ? 
      ORDER BY created_at DESC
    `;
    const [rows] = await pool.execute(query, [sellerId]);
    return rows;
  }

  static async getDashboardStats() {
    const query = `
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available_tickets,
        SUM(CASE WHEN status = 'Sold' THEN 1 ELSE 0 END) as sold_tickets
      FROM tickets
    `;
    const [rows] = await pool.execute(query);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM tickets WHERE id = ?';
    await pool.execute(query, [id]);
  }
}

module.exports = TicketModel;
