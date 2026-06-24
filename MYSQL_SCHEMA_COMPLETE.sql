-- ============================================
-- TICKETBRIDGE PRO - COMPLETE MYSQL SCHEMA
-- ============================================
-- This file contains the complete MySQL database schema
-- for TicketBridge Pro application.
-- 
-- Usage:
-- mysql -u root -p ticketbridge_pro < schema.sql
--
-- ============================================

-- Drop existing tables if exists (for fresh setup)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS waitlist;
DROP TABLE IF EXISTS verified_tickets;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS sellers;
DROP TABLE IF EXISTS users;

-- Enable foreign key constraints
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  profile_image VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  rating DECIMAL(3,2) DEFAULT 5.0,
  verified BOOLEAN DEFAULT FALSE,
  role ENUM('buyer', 'seller', 'admin') DEFAULT 'buyer',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_verified (verified),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SELLERS TABLE
-- ============================================
CREATE TABLE sellers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  business_name VARCHAR(150),
  description TEXT,
  bank_account VARCHAR(50),
  ifsc_code VARCHAR(20),
  tickets_sold INT DEFAULT 0,
  trust_score DECIMAL(5,2) DEFAULT 100.00,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_trust_score (trust_score),
  INDEX idx_verified (is_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TICKETS TABLE
-- ============================================
CREATE TABLE tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_code VARCHAR(50) UNIQUE NOT NULL,
  event_name VARCHAR(200) NOT NULL,
  event_type ENUM('Movie', 'IPL', 'Concert', 'Show', 'Sports', 'Other') NOT NULL,
  event_date DATETIME NOT NULL,
  event_location VARCHAR(200),
  seat_number VARCHAR(50),
  seat_row VARCHAR(20),
  original_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  suggested_price DECIMAL(10,2),
  image_path VARCHAR(255),
  seller_id INT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  heat_score INT DEFAULT 0,
  status ENUM('Available', 'Pending', 'Sold', 'Expired') DEFAULT 'Available',
  quantity INT DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_seller_id (seller_id),
  INDEX idx_status (status),
  INDEX idx_event_type (event_type),
  INDEX idx_event_date (event_date),
  INDEX idx_verified (verified),
  INDEX idx_event_date_status (event_date, status),
  FULLTEXT INDEX idx_event_name (event_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- REQUESTS TABLE (Purchase Requests)
-- ============================================
CREATE TABLE requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT NOT NULL,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  offered_price DECIMAL(10,2),
  status ENUM('Pending', 'Accepted', 'Rejected', 'Expired') DEFAULT 'Pending',
  rejection_reason VARCHAR(255),
  request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  completed_at DATETIME,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ticket_id (ticket_id),
  INDEX idx_buyer_id (buyer_id),
  INDEX idx_seller_id (seller_id),
  INDEX idx_status (status),
  INDEX idx_request_date (request_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CHATS TABLE
-- ============================================
CREATE TABLE chats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  ticket_id INT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL,
  INDEX idx_sender_id (sender_id),
  INDEX idx_receiver_id (receiver_id),
  INDEX idx_ticket_id (ticket_id),
  INDEX idx_is_read (is_read),
  INDEX idx_sent_at (sent_at),
  INDEX idx_conversation (sender_id, receiver_id, sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VERIFIED TICKETS TABLE (QR Verification)
-- ============================================
CREATE TABLE verified_tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_code VARCHAR(50) UNIQUE NOT NULL,
  ticket_id INT NOT NULL,
  qr_hash VARCHAR(255),
  verified_by INT,
  scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_duplicate BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_ticket_code (ticket_code),
  INDEX idx_ticket_id (ticket_id),
  INDEX idx_verified_by (verified_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- WAITLIST TABLE
-- ============================================
CREATE TABLE waitlist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT NOT NULL,
  user_id INT NOT NULL,
  position INT,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notified_at DATETIME,
  UNIQUE KEY unique_waitlist (ticket_id, user_id),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ticket_id (ticket_id),
  INDEX idx_user_id (user_id),
  INDEX idx_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- RATINGS TABLE
-- ============================================
CREATE TABLE ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  seller_id INT NOT NULL,
  buyer_id INT NOT NULL,
  ticket_id INT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  is_verified_purchase BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL,
  INDEX idx_seller_id (seller_id),
  INDEX idx_buyer_id (buyer_id),
  INDEX idx_rating (rating),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  related_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRANSACTIONS TABLE (for payments)
-- ============================================
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  ticket_id INT NOT NULL,
  request_id INT,
  amount DECIMAL(10,2) NOT NULL,
  transaction_type ENUM('Purchase', 'Refund') DEFAULT 'Purchase',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100) UNIQUE,
  status ENUM('Pending', 'Success', 'Failed', 'Refunded') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE RESTRICT,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL,
  INDEX idx_buyer_id (buyer_id),
  INDEX idx_seller_id (seller_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_transaction_id (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CREATE VIEWS
-- ============================================

-- View: Active Tickets
CREATE VIEW active_tickets AS
SELECT 
  t.*,
  u.name as seller_name,
  u.email as seller_email,
  s.is_verified as seller_verified,
  s.trust_score,
  COUNT(DISTINCT r.id) as request_count
FROM tickets t
JOIN users u ON t.seller_id = u.id
LEFT JOIN sellers s ON u.id = s.user_id
LEFT JOIN requests r ON t.id = r.ticket_id AND r.status = 'Pending'
WHERE t.status = 'Available' AND t.event_date > NOW()
GROUP BY t.id;

-- View: Top Sellers
CREATE VIEW top_sellers AS
SELECT 
  u.id,
  u.name,
  u.profile_image,
  s.is_verified,
  s.tickets_sold,
  s.trust_score,
  AVG(r.rating) as avg_rating,
  COUNT(DISTINCT r.id) as rating_count
FROM users u
JOIN sellers s ON u.id = s.user_id
LEFT JOIN ratings r ON s.user_id = r.seller_id
GROUP BY u.id
ORDER BY s.trust_score DESC, s.tickets_sold DESC;

-- View: Seller Statistics
CREATE VIEW seller_statistics AS
SELECT 
  u.id as seller_id,
  u.name,
  COUNT(DISTINCT t.id) as total_tickets,
  SUM(CASE WHEN t.status = 'Available' THEN 1 ELSE 0 END) as available_tickets,
  SUM(CASE WHEN t.status = 'Sold' THEN 1 ELSE 0 END) as sold_tickets,
  SUM(CASE WHEN t.status = 'Sold' THEN t.selling_price ELSE 0 END) as total_revenue,
  AVG(r.rating) as avg_rating
FROM users u
LEFT JOIN tickets t ON u.id = t.seller_id
LEFT JOIN ratings r ON u.id = r.seller_id
WHERE u.role = 'seller'
GROUP BY u.id;

-- ============================================
-- CREATE STORED PROCEDURES
-- ============================================

DELIMITER //

-- Procedure: Update Ticket Heat Score
CREATE PROCEDURE UpdateTicketHeatScore(IN p_ticket_id INT, IN p_new_score INT)
BEGIN
  UPDATE tickets 
  SET heat_score = LEAST(100, GREATEST(0, p_new_score))
  WHERE id = p_ticket_id;
END //

-- Procedure: Calculate Seller Trust Score
CREATE PROCEDURE UpdateSellerTrustScore(IN p_seller_id INT)
BEGIN
  DECLARE avg_rating DECIMAL(3,2);
  DECLARE sold_tickets INT;
  DECLARE new_score DECIMAL(5,2);
  
  SELECT COALESCE(AVG(r.rating), 5) INTO avg_rating
  FROM ratings r
  WHERE r.seller_id = p_seller_id;
  
  SELECT COALESCE(tickets_sold, 0) INTO sold_tickets
  FROM sellers
  WHERE user_id = p_seller_id;
  
  SET new_score = (avg_rating * 80) + (LEAST(sold_tickets, 100) * 0.2);
  
  UPDATE sellers
  SET trust_score = LEAST(100, new_score)
  WHERE user_id = p_seller_id;
END //

-- Procedure: Expire Old Tickets
CREATE PROCEDURE ExpireOldTickets()
BEGIN
  UPDATE tickets 
  SET status = 'Expired'
  WHERE status IN ('Available', 'Pending')
  AND event_date < NOW();
END //

-- Procedure: Get Available Tickets with Filters
CREATE PROCEDURE GetAvailableTickets(
  IN p_event_type VARCHAR(50),
  IN p_min_price DECIMAL(10,2),
  IN p_max_price DECIMAL(10,2),
  IN p_limit INT,
  IN p_offset INT
)
BEGIN
  SELECT t.*, u.name as seller_name
  FROM tickets t
  JOIN users u ON t.seller_id = u.id
  WHERE t.status = 'Available'
  AND (p_event_type IS NULL OR t.event_type = p_event_type)
  AND (p_min_price IS NULL OR t.selling_price >= p_min_price)
  AND (p_max_price IS NULL OR t.selling_price <= p_max_price)
  ORDER BY t.heat_score DESC, t.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END //

DELIMITER ;

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Index for date range queries
CREATE INDEX idx_event_date_range ON tickets(event_date DESC);

-- Index for price range queries
CREATE INDEX idx_price_range ON tickets(selling_price ASC);

-- Index for seller performance
CREATE INDEX idx_seller_revenue ON tickets(seller_id, selling_price);

-- Index for chat queries
CREATE INDEX idx_chat_full_conversation ON chats(sender_id, receiver_id, sent_at DESC);

-- Index for notification queries
CREATE INDEX idx_user_notifications ON notifications(user_id, is_read, created_at DESC);

-- ============================================
-- INSERT INITIAL DATA (OPTIONAL)
-- ============================================

-- Insert admin user (password hash is for 'admin123')
INSERT INTO users (name, email, password, role, verified) VALUES
('Admin', 'admin@example.com', '$2a$12$RQk3VKtZzZqjLXWLVm0BgePddaVJh5VKxvZVHxQpFGvQxJnD5DnKW', 'admin', 1);

-- Update admin last login
UPDATE users SET updated_at = NOW() WHERE role = 'admin';

-- ============================================
-- GRANT PRIVILEGES (If using separate user)
-- ============================================

-- Uncomment and modify if you want to create a specific database user:
-- CREATE USER 'ticketbridge'@'localhost' IDENTIFIED BY 'secure_password';
-- GRANT ALL PRIVILEGES ON ticketbridge_pro.* TO 'ticketbridge'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================
-- VERIFY SCHEMA
-- ============================================

-- Show all tables
-- SHOW TABLES;

-- Show table structure
-- DESCRIBE users;
-- DESCRIBE sellers;
-- DESCRIBE tickets;
-- DESCRIBE requests;
-- DESCRIBE chats;
-- DESCRIBE verified_tickets;
-- DESCRIBE waitlist;
-- DESCRIBE ratings;
-- DESCRIBE notifications;
-- DESCRIBE transactions;

-- ============================================
-- END OF SCHEMA
-- ============================================
