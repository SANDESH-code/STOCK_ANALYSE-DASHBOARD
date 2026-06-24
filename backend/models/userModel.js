const pool = require('../config/database');

class UserModel {
  static async create(name, email, hashedPassword, role = 'buyer') {
    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    const [result] = await pool.execute(query, [name, email, hashedPassword, role]);
    
    if (role === 'seller') {
      await pool.execute('INSERT INTO sellers (user_id) VALUES (?)', [result.insertId]);
    }
    
    return result.insertId;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const query = 'SELECT id, name, email, role, profile_image, phone, address, verified, is_active, created_at FROM users WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  static async updateProfile(id, data) {
    const { name, phone, address, profile_image } = data;
    const query = 'UPDATE users SET name = ?, phone = ?, address = ?, profile_image = ? WHERE id = ?';
    await pool.execute(query, [name, phone, address, profile_image, id]);
  }

  static async getAllUsers() {
    const query = 'SELECT id, name, email, role, verified, is_active, created_at FROM users';
    const [rows] = await pool.execute(query);
    return rows;
  }

  static async getSellerProfile(sellerId) {
    const query = `
      SELECT u.*, s.business_name, s.description, s.tickets_sold, s.trust_score, s.is_verified
      FROM users u
      LEFT JOIN sellers s ON u.id = s.user_id
      WHERE u.id = ?
    `;
    const [rows] = await pool.execute(query, [sellerId]);
    return rows[0] || null;
  }

  static async getUserRatings(sellerId) {
    const query = `
      SELECT r.*, b.name as buyer_name, b.profile_image
      FROM ratings r
      JOIN users b ON r.buyer_id = b.id
      WHERE r.seller_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await pool.execute(query, [sellerId]);
    return rows;
  }
}

module.exports = UserModel;
