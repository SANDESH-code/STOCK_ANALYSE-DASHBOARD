# DEPLOYMENT, SETUP & COMPLETE GUIDE

## DATABASE SETUP

### MySQL Schema (schema.sql)

Place this in `database/schema.sql` and run:

```bash
mysql -u root -p ticketbridge_pro < database/schema.sql
```

[Full schema is in COMPLETE_IMPLEMENTATION_GUIDE.md]

### Seed Data (seed-data.sql)

```sql
-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert test users
INSERT INTO users (name, email, password, role, verified) VALUES
('Sai Sandesh', 'sai@example.com', '$2a$12$...hashed_password...', 'seller', 1),
('Priya Sharma', 'priya@example.com', '$2a$12$...hashed_password...', 'buyer', 1),
('Admin User', 'admin@example.com', '$2a$12$...hashed_password...', 'admin', 1);

-- Insert seller profile
INSERT INTO sellers (user_id, business_name, tickets_sold, trust_score, is_verified) VALUES
(1, 'Sai Sandesh Tickets', 52, 95.5, 1);

-- Insert sample tickets
INSERT INTO tickets (ticket_code, event_name, event_type, event_date, event_location, seat_number, original_price, selling_price, seller_id, verified) VALUES
('TKT-ABC12345', 'Avengers Endgame', 'Movie', '2026-07-15 19:00:00', 'PVR, Mumbai', 'A1', 300, 250, 1, 1),
('TKT-DEF67890', 'IPL Match - MI vs CSK', 'IPL', '2026-07-20 19:30:00', 'Wankhede Stadium', 'B5', 1500, 1200, 1, 1),
('TKT-GHI11111', 'Taylor Swift Concert', 'Concert', '2026-08-10 18:00:00', 'MMRDA Grounds', 'C10', 5000, 4500, 1, 1);

-- Insert verified tickets
INSERT INTO verified_tickets (ticket_code, ticket_id, verified_by) VALUES
('TKT-ABC12345', 1, 1),
('TKT-DEF67890', 2, 1),
('TKT-GHI11111', 3, 1);

-- Insert ratings
INSERT INTO ratings (seller_id, buyer_id, ticket_id, rating, review) VALUES
(1, 2, 1, 5, 'Great seller! Ticket was authentic and delivered on time.'),
(1, 2, 2, 4, 'Good experience. Will buy again.');
```

---

## PROJECT SETUP GUIDE

### Step 1: Clone & Initialize

```bash
# Create project directory
mkdir ticketbridge-pro
cd ticketbridge-pro

# Initialize git
git init

# Create backend directory
mkdir backend
cd backend
npm init -y

# Create frontend directory
cd ..
npx create-vite@latest frontend --template react
cd frontend
npm install
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install express mysql2 cors dotenv bcryptjs jsonwebtoken multer helmet morgan socket.io nodemailer

# Create directory structure
mkdir config controllers models routes middleware utils uploads

# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ticketbridge_pro
PORT=5000
JWT_SECRET=ticketbridge_jwt_secret_2026
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
EOF

# Copy all backend files from the guides
# (server.js, config/database.js, config/env.js, etc.)

# Start server
npm run dev
```

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install axios react-router-dom

# Create directory structure
mkdir src/components src/pages src/services src/context src/hooks src/styles src/utils

# Copy all frontend files
# (App.jsx, components/, pages/, services/, etc.)

# Start development server
npm run dev
```

### Step 4: Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE ticketbridge_pro;
exit;

# Import schema
mysql -u root -p ticketbridge_pro < ../database/schema.sql

# Import seed data
mysql -u root -p ticketbridge_pro < ../database/seed-data.sql
```

---

## PRODUCTION DEPLOYMENT

### Backend Deployment (AWS EC2)

```bash
# 1. Launch EC2 instance (Ubuntu 22.04)
# 2. SSH into instance
ssh -i key.pem ubuntu@instance-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install MySQL client
sudo apt-get install -y mysql-client

# 5. Clone repository
git clone your-repo-url
cd ticketbridge-pro/backend

# 6. Install dependencies
npm install --production

# 7. Create production .env
cat > .env << EOF
DB_HOST=your-rds-endpoint
DB_USER=admin
DB_PASSWORD=strong_password
DB_NAME=ticketbridge_pro
PORT=5000
JWT_SECRET=production_secret_key_change_this
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
EOF

# 8. Install PM2 globally
sudo npm install -g pm2

# 9. Start app with PM2
pm2 start server.js --name "ticketbridge-api"
pm2 startup
pm2 save

# 10. Install and configure Nginx
sudo apt-get install -y nginx

# 11. Configure Nginx
sudo nano /etc/nginx/sites-available/default
# Add:
# server {
#   listen 80;
#   server_name yourdomain.com;
#   location / {
#     proxy_pass http://localhost:5000;
#     proxy_http_version 1.1;
#     proxy_set_header Upgrade $http_upgrade;
#     proxy_set_header Connection 'upgrade';
#     proxy_set_header Host $host;
#     proxy_cache_bypass $http_upgrade;
#   }
# }

sudo systemctl restart nginx

# 12. Install SSL certificate
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Frontend Deployment (Vercel)

```bash
cd frontend

# 1. Build project
npm run build

# 2. Install Vercel CLI
npm i -g vercel

# 3. Deploy
vercel --prod

# 4. Configure environment variables in Vercel dashboard
# VITE_API_BASE_URL=https://api.yourdomain.com
```

### Database (AWS RDS)

1. Create RDS MySQL instance
2. Set security groups to allow EC2 instance
3. Create database and import schema
4. Update backend .env with RDS endpoint

---

## TESTING & QUALITY ASSURANCE

### Backend Testing

```bash
# Install test dependencies
npm install --save-dev jest supertest

# Create test file
mkdir tests
cat > tests/auth.test.js << EOF
const request = require('supertest');
const app = require('../server');

describe('Authentication', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it('should login user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
EOF

# Run tests
npm test
```

### Frontend Testing

```bash
# Install testing library
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Create test
cat > src/__tests__/Auth.test.jsx << EOF
import { render, screen } from '@testing-library/react';
import LoginPage from '../pages/LoginPage';

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });
});
EOF

# Run tests
npm test
```

---

## MONITORING & LOGGING

### Error Tracking

```javascript
// Sentry integration (backend)
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.errorHandler());
```

### Performance Monitoring

```javascript
// New Relic (optional)
require('newrelic');

const app = require('express')();
// Your app code
```

### Log Aggregation

```bash
# Install Winston for logging
npm install winston

# Create logger
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## SECURITY BEST PRACTICES

### 1. Environment Variables
- Never commit .env files
- Use strong JWT secrets (min 32 characters)
- Rotate secrets periodically

### 2. Password Security
- Use bcryptjs with salt rounds 12+
- Enforce strong password requirements
- Implement rate limiting on login

### 3. Database Security
- Use parameterized queries (already implemented)
- Enable SSL for database connections
- Regular backups

### 4. API Security
- Use HTTPS only
- Implement CORS properly
- Add rate limiting
- Validate all inputs

### 5. File Uploads
- Validate file types
- Limit file size
- Store outside web root
- Scan for malware

---

## PERFORMANCE OPTIMIZATION

### Backend
```javascript
// Implement caching
const redis = require('redis');
const client = redis.createClient();

// Cache frequently accessed data
app.get('/tickets', async (req, res) => {
  const cached = await client.get('tickets');
  if (cached) return res.json(JSON.parse(cached));
  
  const tickets = await TicketModel.getAll();
  await client.setex('tickets', 3600, JSON.stringify(tickets));
  res.json(tickets);
});
```

### Frontend
```javascript
// Code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));

// Image optimization
import { Image } from './components/Image';

// Suspense boundaries
<Suspense fallback={<Loader />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
  </Routes>
</Suspense>
```

---

## SCALING STRATEGY

### Horizontal Scaling
- Use load balancer (AWS ALB)
- Multiple backend instances
- Auto-scaling groups

### Caching Layer
- Redis for session management
- Cache API responses
- CDN for static assets

### Database Optimization
- Query optimization
- Indexing strategy
- Read replicas for read-heavy operations

---

## FEATURES MIGRATION CHECKLIST

✅ User authentication (JWT)
✅ Ticket upload and management
✅ Search and filtering
✅ Purchase request system
✅ Chat messaging
✅ AI price recommendation
✅ QR code verification
✅ Seller dashboard
✅ Admin dashboard
✅ Rating and review system
✅ Waitlist functionality
✅ Notification system
✅ Dark mode
✅ Responsive design
✅ Error handling
✅ Input validation
✅ File upload
✅ Real-time updates (Socket.io ready)

---

## API ENDPOINTS REFERENCE

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets` - List all tickets
- `GET /api/tickets/:id` - Get ticket details
- `GET /api/tickets/seller/tickets` - Get seller's tickets
- `DELETE /api/tickets/:id` - Delete ticket
- `GET /api/tickets/stats` - Get dashboard stats

### Requests
- `POST /api/requests` - Create request
- `GET /api/requests/my-requests` - Get buyer's requests
- `GET /api/requests/received` - Get seller's received requests
- `PUT /api/requests/:id` - Update request status

### Chat
- `POST /api/chats/send` - Send message
- `GET /api/chats/conversation/:userId` - Get conversation
- `GET /api/chats/list` - Get all chats
- `PUT /api/chats/read` - Mark as read

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/:id` - Get public profile
- `GET /api/users/:id/ratings` - Get user ratings

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `GET /api/admin/tickets` - List tickets
- `PUT /api/admin/tickets/:id/verify` - Verify ticket
- `POST /api/admin/users/:id/ban` - Ban user

---

## TROUBLESHOOTING

### Database Connection Issues
```bash
# Test MySQL connection
mysql -h localhost -u root -p ticketbridge_pro

# Check environment variables
echo $DB_HOST
echo $DB_NAME
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 PID
```

### CORS Errors
- Check CORS_ORIGIN in backend .env
- Ensure frontend URL matches exactly
- Include credentials in requests if needed

### JWT Token Issues
- Verify token format (Bearer token)
- Check JWT_SECRET is same in .env
- Ensure token hasn't expired

---

## SUPPORT & MAINTENANCE

### Regular Tasks
- Monitor server logs daily
- Backup database weekly
- Update dependencies monthly
- Review security patches
- Analyze performance metrics

### Scaling Milestones
- <1000 users: Single server setup
- 1000-10000 users: Load balancer + multiple servers
- 10000+ users: Database replication + CDN

---

All code follows production standards with comprehensive error handling, validation, security measures, and scalability considerations!
