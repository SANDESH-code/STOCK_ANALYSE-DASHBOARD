# TicketBridge Pro - Production Ready Migration Guide

## Complete Backend Implementation

### 1. SERVER.JS - Main Express Server

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${config.NODE_ENV}`);
});

module.exports = app;
```

### 2. CONFIG - Database Connection

```javascript
const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  port: config.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

pool.getConnection()
  .then(connection => {
    console.log('✓ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('✗ Database connection failed:', err.message);
  });

module.exports = pool;
```

### 3. MODELS - User Model

```javascript
const pool = require('../config/database');

class UserModel {
  // Create user
  static async create(userData) {
    const { name, email, password, role } = userData;
    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [name, email, password, role || 'buyer']);
    return result;
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.query(query, [email]);
    return rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, name, email, role, verified, rating, profile_image, created_at FROM users WHERE id = ?';
    const [rows] = await pool.query(query, [id]);
    return rows[0];
  }

  // Update user profile
  static async updateProfile(userId, updateData) {
    const { name, profile_image, phone, address } = updateData;
    const query = `
      UPDATE users 
      SET name = ?, profile_image = ?, phone = ?, address = ?
      WHERE id = ?
    `;
    await pool.query(query, [name, profile_image, phone, address, userId]);
  }

  // Get all users (admin only)
  static async getAllUsers(limit = 10, offset = 0) {
    const query = `
      SELECT id, name, email, role, verified, rating, created_at 
      FROM users 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [limit, offset]);
    return rows;
  }

  // Get seller profile
  static async getSellerProfile(userId) {
    const query = `
      SELECT u.*, s.business_name, s.description, s.tickets_sold, s.trust_score, s.is_verified
      FROM users u
      LEFT JOIN sellers s ON u.id = s.user_id
      WHERE u.id = ? AND u.role = 'seller'
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows[0];
  }

  // Get user ratings
  static async getUserRatings(userId) {
    const query = `
      SELECT r.*, u.name as buyer_name, u.profile_image
      FROM ratings r
      JOIN users u ON r.buyer_id = u.id
      WHERE r.seller_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows;
  }
}

module.exports = UserModel;
```

### 4. MODELS - Ticket Model

```javascript
const pool = require('../config/database');

class TicketModel {
  // Create ticket
  static async create(ticketData) {
    const {
      ticket_code, event_name, event_type, event_date, event_location,
      seat_number, original_price, selling_price, suggested_price,
      image_path, seller_id, quantity, description
    } = ticketData;

    const query = `
      INSERT INTO tickets (
        ticket_code, event_name, event_type, event_date, event_location,
        seat_number, original_price, selling_price, suggested_price,
        image_path, seller_id, quantity, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      ticket_code, event_name, event_type, event_date, event_location,
      seat_number, original_price, selling_price, suggested_price,
      image_path, seller_id, quantity, description
    ]);

    return result;
  }

  // Get all tickets with filters
  static async getAll(filters = {}) {
    let query = `
      SELECT t.*, u.name as seller_name, u.profile_image,
             (SELECT COUNT(*) FROM ratings WHERE seller_id = t.seller_id) as seller_ratings
      FROM tickets t
      JOIN users u ON t.seller_id = u.id
      WHERE t.status = 'Available'
    `;

    const params = [];

    if (filters.event_type) {
      query += ' AND t.event_type = ?';
      params.push(filters.event_type);
    }

    if (filters.search) {
      query += ' AND t.event_name LIKE ?';
      params.push(`%${filters.search}%`);
    }

    if (filters.min_price) {
      query += ' AND t.selling_price >= ?';
      params.push(filters.min_price);
    }

    if (filters.max_price) {
      query += ' AND t.selling_price <= ?';
      params.push(filters.max_price);
    }

    query += ' ORDER BY t.heat_score DESC, t.created_at DESC LIMIT 50';

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get ticket by ID
  static async getById(id) {
    const query = `
      SELECT t.*, u.name as seller_name, u.profile_image, u.email as seller_email,
             s.is_verified, s.trust_score, s.tickets_sold
      FROM tickets t
      JOIN users u ON t.seller_id = u.id
      LEFT JOIN sellers s ON u.id = s.user_id
      WHERE t.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0];
  }

  // Update ticket status
  static async updateStatus(id, status) {
    const query = 'UPDATE tickets SET status = ? WHERE id = ?';
    await pool.query(query, [status, id]);
  }

  // Update ticket heat score (demand)
  static async updateHeatScore(id, score) {
    const query = 'UPDATE tickets SET heat_score = ? WHERE id = ?';
    await pool.query(query, [Math.min(100, score), id]);
  }

  // Get seller tickets
  static async getSellerTickets(sellerId) {
    const query = `
      SELECT * FROM tickets 
      WHERE seller_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await pool.query(query, [sellerId]);
    return rows;
  }

  // Get dashboard stats
  static async getDashboardStats() {
    const query = `
      SELECT
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available_tickets,
        SUM(CASE WHEN status = 'Sold' THEN 1 ELSE 0 END) as sold_tickets,
        SUM(CASE WHEN status = 'Available' THEN selling_price ELSE 0 END) as market_value
      FROM tickets
    `;
    const [rows] = await pool.query(query);
    return rows[0];
  }
}

module.exports = TicketModel;
```

### 5. MODELS - Request Model

```javascript
const pool = require('../config/database');

class RequestModel {
  // Create request
  static async create(requestData) {
    const { ticket_id, buyer_id, seller_id, offered_price } = requestData;
    const query = `
      INSERT INTO requests (ticket_id, buyer_id, seller_id, offered_price)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [ticket_id, buyer_id, seller_id, offered_price]);
    return result;
  }

  // Get request by ID
  static async getById(id) {
    const query = `
      SELECT r.*, t.event_name, t.selling_price,
             b.name as buyer_name, b.email as buyer_email,
             s.name as seller_name
      FROM requests r
      JOIN tickets t ON r.ticket_id = t.id
      JOIN users b ON r.buyer_id = b.id
      JOIN users s ON r.seller_id = s.id
      WHERE r.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0];
  }

  // Get buyer requests
  static async getBuyerRequests(buyerId) {
    const query = `
      SELECT r.*, t.event_name, t.event_date, t.image_path,
             s.name as seller_name, s.profile_image
      FROM requests r
      JOIN tickets t ON r.ticket_id = t.id
      JOIN users s ON r.seller_id = s.id
      WHERE r.buyer_id = ?
      ORDER BY r.request_date DESC
    `;
    const [rows] = await pool.query(query, [buyerId]);
    return rows;
  }

  // Get seller requests
  static async getSellerRequests(sellerId) {
    const query = `
      SELECT r.*, t.event_name, t.selling_price, t.image_path,
             b.name as buyer_name, b.profile_image, b.email as buyer_email
      FROM requests r
      JOIN tickets t ON r.ticket_id = t.id
      JOIN users b ON r.buyer_id = b.id
      WHERE r.seller_id = ?
      ORDER BY r.request_date DESC
    `;
    const [rows] = await pool.query(query, [sellerId]);
    return rows;
  }

  // Update request status
  static async updateStatus(id, status, rejectionReason = null) {
    const query = `
      UPDATE requests 
      SET status = ?, responded_at = NOW(), rejection_reason = ?
      WHERE id = ?
    `;
    await pool.query(query, [status, rejectionReason, id]);
  }

  // Get pending requests count
  static async getPendingCount(sellerId) {
    const query = `
      SELECT COUNT(*) as count FROM requests 
      WHERE seller_id = ? AND status = 'Pending'
    `;
    const [rows] = await pool.query(query, [sellerId]);
    return rows[0].count;
  }
}

module.exports = RequestModel;
```

### 6. MODELS - Chat Model

```javascript
const pool = require('../config/database');

class ChatModel {
  // Create message
  static async createMessage(chatData) {
    const { sender_id, receiver_id, ticket_id, message } = chatData;
    const query = `
      INSERT INTO chats (sender_id, receiver_id, ticket_id, message)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [sender_id, receiver_id, ticket_id, message]);
    return result;
  }

  // Get conversation between two users
  static async getConversation(userId1, userId2, limit = 50) {
    const query = `
      SELECT c.*, u.name as sender_name, u.profile_image
      FROM chats c
      JOIN users u ON c.sender_id = u.id
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY c.sent_at DESC
      LIMIT ?
    `;
    const [rows] = await pool.query(query, [userId1, userId2, userId2, userId1, limit]);
    return rows.reverse();
  }

  // Get all chats for user
  static async getUserChats(userId) {
    const query = `
      SELECT 
        c.*, 
        CASE 
          WHEN sender_id = ? THEN receiver_id 
          ELSE sender_id 
        END as other_user_id,
        u.name as other_user_name,
        u.profile_image
      FROM chats c
      JOIN users u ON (
        CASE 
          WHEN c.sender_id = ? THEN c.receiver_id 
          ELSE c.sender_id 
        END = u.id
      )
      WHERE sender_id = ? OR receiver_id = ?
      ORDER BY c.sent_at DESC
      GROUP BY (CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END)
    `;
    const [rows] = await pool.query(query, [userId, userId, userId, userId, userId]);
    return rows;
  }

  // Mark messages as read
  static async markAsRead(senderId, receiverId) {
    const query = `
      UPDATE chats 
      SET is_read = TRUE
      WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE
    `;
    await pool.query(query, [senderId, receiverId]);
  }

  // Get unread count
  static async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*) as count FROM chats 
      WHERE receiver_id = ? AND is_read = FALSE
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows[0].count;
  }
}

module.exports = ChatModel;
```

### 7. CONTROLLERS - Auth Controller

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const config = require('../config/env');
const { validateEmail, validatePassword } = require('../utils/validators');

class AuthController {
  // Register
  static async register(req, res) {
    try {
      const { name, email, password, confirmPassword, role } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      if (!validatePassword(password)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      // Check if user exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const userData = {
        name,
        email,
        password: hashedPassword,
        role: role || 'buyer'
      };

      const result = await UserModel.create(userData);

      // If seller, create seller profile
      if (role === 'seller') {
        const pool = require('../config/database');
        await pool.query(
          'INSERT INTO sellers (user_id) VALUES (?)',
          [result.insertId]
        );
      }

      // Generate tokens
      const token = AuthController.generateToken(result.insertId);
      const refreshToken = AuthController.generateRefreshToken(result.insertId);

      res.status(201).json({
        message: 'User registered successfully',
        user: { id: result.insertId, name, email, role: role || 'buyer' },
        token,
        refreshToken
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate tokens
      const token = AuthController.generateToken(user.id);
      const refreshToken = AuthController.generateRefreshToken(user.id);

      // Update last login
      const pool = require('../config/database');
      await pool.query('UPDATE users SET updated_at = NOW() WHERE id = ?', [user.id]);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          verified: user.verified
        },
        token,
        refreshToken
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Refresh token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
      const token = AuthController.generateToken(decoded.id);

      res.json({ token });
    } catch (error) {
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  // Generate JWT token
  static generateToken(userId) {
    return jwt.sign({ id: userId }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE
    });
  }

  // Generate refresh token
  static generateRefreshToken(userId) {
    return jwt.sign({ id: userId }, config.JWT_SECRET, {
      expiresIn: config.REFRESH_TOKEN_EXPIRE
    });
  }
}

module.exports = AuthController;
```

### 8. CONTROLLERS - Ticket Controller

```javascript
const TicketModel = require('../models/ticketModel');
const { generateTicketCode } = require('../utils/qrGenerator');
const { getAIPriceRecommendation } = require('../utils/priceRecommendation');

class TicketController {
  // Create ticket
  static async createTicket(req, res) {
    try {
      const {
        event_name, event_type, event_date, event_location,
        seat_number, original_price, selling_price, quantity, description
      } = req.body;

      const seller_id = req.user.id;
      const image_path = req.file ? `/uploads/${req.file.filename}` : null;

      // Validation
      if (!event_name || !event_type || !event_date || !original_price) {
        return res.status(400).json({ error: 'Required fields missing' });
      }

      // Calculate suggested price
      const suggested_price = getAIPriceRecommendation(original_price, event_date);

      // Generate unique ticket code
      const ticket_code = generateTicketCode();

      const ticketData = {
        ticket_code,
        event_name,
        event_type,
        event_date,
        event_location,
        seat_number,
        original_price: parseFloat(original_price),
        selling_price: parseFloat(selling_price),
        suggested_price,
        image_path,
        seller_id,
        quantity: parseInt(quantity) || 1,
        description
      };

      const result = await TicketModel.create(ticketData);

      // Verify ticket in verification table
      const pool = require('../config/database');
      await pool.query(
        'INSERT INTO verified_tickets (ticket_code, ticket_id, verified_by) VALUES (?, ?, ?)',
        [ticket_code, result.insertId, seller_id]
      );

      res.status(201).json({
        message: 'Ticket created successfully',
        ticket: { id: result.insertId, ticket_code, ...ticketData }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get all tickets
  static async getAllTickets(req, res) {
    try {
      const { event_type, search, min_price, max_price } = req.query;

      const filters = {
        event_type,
        search,
        min_price: min_price ? parseFloat(min_price) : null,
        max_price: max_price ? parseFloat(max_price) : null
      };

      const tickets = await TicketModel.getAll(filters);
      res.json({
        count: tickets.length,
        tickets
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get ticket by ID
  static async getTicket(req, res) {
    try {
      const { id } = req.params;
      const ticket = await TicketModel.getById(id);

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get seller tickets
  static async getSellerTickets(req, res) {
    try {
      const seller_id = req.user.id;
      const tickets = await TicketModel.getSellerTickets(seller_id);

      res.json({
        count: tickets.length,
        tickets
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete ticket
  static async deleteTicket(req, res) {
    try {
      const { id } = req.params;
      const seller_id = req.user.id;

      const ticket = await TicketModel.getById(id);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      if (ticket.seller_id !== seller_id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const pool = require('../config/database');
      await pool.query('DELETE FROM tickets WHERE id = ?', [id]);

      res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get dashboard stats
  static async getDashboardStats(req, res) {
    try {
      const stats = await TicketModel.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TicketController;
```

### 9. MIDDLEWARE - Auth Middleware

```javascript
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

module.exports = { authMiddleware, adminMiddleware };
```

### 10. UTILITIES - Price Recommendation

```javascript
// Price recommendation based on event date and original price
function getAIPriceRecommendation(originalPrice, eventDate) {
  const now = new Date();
  const eventTime = new Date(eventDate);
  const hoursUntilEvent = (eventTime - now) / (1000 * 60 * 60);

  let discount = 0;

  if (hoursUntilEvent < 6) {
    discount = 0.30; // 30% discount (70% of price)
  } else if (hoursUntilEvent < 24) {
    discount = 0.15; // 15% discount (85% of price)
  } else if (hoursUntilEvent < 48) {
    discount = 0.05; // 5% discount (95% of price)
  } else {
    discount = 0; // Full price
  }

  return Math.round(originalPrice * (1 - discount));
}

module.exports = { getAIPriceRecommendation };
```

### 11. UTILITIES - QR Generator

```javascript
const crypto = require('crypto');

function generateTicketCode() {
  return 'TKT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

function generateQRHash(ticketCode) {
  return crypto.createHash('sha256').update(ticketCode).digest('hex');
}

function verifyTicketHash(ticketCode, hash) {
  const generated = generateQRHash(ticketCode);
  return generated === hash;
}

module.exports = {
  generateTicketCode,
  generateQRHash,
  verifyTicketHash
};
```

### 12. UTILITIES - Validators

```javascript
function validateEmail(email) {
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return regex.test(email);
}

function validatePassword(password) {
  return password.length >= 8;
}

function validatePhoneNumber(phone) {
  const regex = /^[0-9]{10}$/;
  return regex.test(phone);
}

module.exports = {
  validateEmail,
  validatePassword,
  validatePhoneNumber
};
```

### 13. PACKAGE.JSON - Backend

```json
{
  "name": "ticketbridge-backend",
  "version": "1.0.0",
  "description": "TicketBridge Pro Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "nodemailer": "^6.9.1",
    "socket.io": "^4.6.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0"
  }
}
```

---

## Complete Frontend Implementation

### REACT STRUCTURE & COMPONENTS

Continue in next section...
