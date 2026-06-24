# TicketBridge Pro - Setup & Run Guide

## 📋 Prerequisites

- Node.js (v16+)
- npm or yarn
- MySQL 8.0+
- Git (optional)

---

## 🗄️ Step 1: Database Setup

### 1.1 Create MySQL Database

```bash
mysql -u root -p
```

Then run:
```sql
CREATE DATABASE ticketbridge_pro;
```

### 1.2 Create Database Schema

```bash
mysql -u root -p ticketbridge_pro < MYSQL_SCHEMA_COMPLETE.sql
```

### 1.3 Verify Tables Created

```bash
mysql -u root -p ticketbridge_pro
SHOW TABLES;
```

---

## 🚀 Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Create .env File

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ticketbridge_pro

JWT_SECRET=your_super_secret_key_change_this
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### 2.4 Start Backend Server

```bash
npm run dev
```

Expected output:
```
✅ MySQL Database connected successfully
🚀 TicketBridge Pro Backend
✅ Server running on http://localhost:5000
📁 Environment: development
🗄️  Database: ticketbridge_pro
```

---

## 💻 Step 3: Frontend Setup

### 3.1 Open New Terminal & Navigate to Frontend

```bash
cd frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Start Frontend Dev Server

```bash
npm run dev
```

Expected output:
```
VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## ✅ Step 4: Verify Setup

### Backend Health Check

```bash
curl http://localhost:5000/api/health
```

### Frontend Access

Open browser: `http://localhost:5173`

---

## 🧪 Step 5: Test Features

### 5.1 Sign Up
- Go to http://localhost:5173/signup
- Create account (choose "seller" for testing all features)
- You should be redirected to home page

### 5.2 Login
- Go to http://localhost:5173/login
- Use credentials from signup

### 5.3 Upload Ticket (Seller)
- Click "Upload Ticket" button
- Fill form and submit
- Should see ticket on home page

### 5.4 Browse Tickets
- Go to home page
- See all available tickets
- Use search/filter

### 5.5 Make Request
- Click "Request to Buy" on any ticket
- Enter offered price
- Should see success message

---

## 📁 Project Structure

```
SecondBox/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── ticketController.js
│   │   ├── requestController.js
│   │   └── chatController.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── ticketModel.js
│   │   ├── requestModel.js
│   │   └── chatModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── ticketRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── chatRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── validators.js
│   │   ├── qrGenerator.js
│   │   └── priceRecommendation.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useFetch.js
│   │   │   └── useForm.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── ticketService.js
│   │   │   ├── requestService.js
│   │   │   ├── chatService.js
│   │   │   └── userService.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Stats.jsx
│   │   │   ├── SearchSection.jsx
│   │   │   ├── TicketCard.jsx
│   │   │   ├── UploadModal.jsx
│   │   │   ├── ChatModal.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   └── SellerDashboard.jsx
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── responsive.css
│   │   │   └── pages.css
│   │   ├── utils/
│   │   │   └── priceRecommendation.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── MYSQL_SCHEMA_COMPLETE.sql
├── SETUP_AND_RUN_GUIDE.md (this file)
└── README.md
```

---

## 🐛 Troubleshooting

### Backend Won't Start
- **Error: "Cannot find module 'mysql2'"**
  - Run: `npm install` in backend directory
  
- **Error: "ECONNREFUSED" on database connection**
  - Ensure MySQL is running: `brew services start mysql` (Mac) or check Services (Windows)
  - Check DB credentials in .env file

- **Port 5000 already in use**
  - Change PORT in .env
  - Or kill process: `lsof -i :5000` then `kill -9 <PID>`

### Frontend Won't Start
- **Error: "Cannot find module 'react'"**
  - Run: `npm install` in frontend directory
  
- **Blank page or API errors**
  - Ensure backend is running on port 5000
  - Check browser console for errors (F12)
  - Verify CORS_ORIGIN in backend .env

- **Port 5173 already in use**
  - Change port in vite.config.js
  - Or kill process: `lsof -i :5173` then `kill -9 <PID>`

### Database Issues
- **Error: "Unknown database 'ticketbridge_pro'"**
  - Run: `mysql -u root -p < MYSQL_SCHEMA_COMPLETE.sql`
  
- **Error: "Access denied for user"**
  - Check MySQL password in .env
  - Verify user has privileges

---

## 📝 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | User login |
| GET | /api/tickets | Get all tickets |
| POST | /api/tickets | Create new ticket |
| GET | /api/tickets/:id | Get ticket details |
| POST | /api/requests | Create purchase request |
| GET | /api/requests/my-requests | Get user's requests |
| POST | /api/chats/send | Send message |
| GET | /api/chats/conversation/:userId | Get chat history |

---

## 🎨 Features Checklist

✅ User Authentication (Login/Signup)
✅ Ticket Upload with Image
✅ Browse & Search Tickets
✅ AI Price Recommendation
✅ Purchase Requests
✅ Chat System
✅ Seller Dashboard
✅ Dark Mode
✅ Responsive Design
✅ Error Handling
✅ Input Validation

---

## 🚢 Ready for Production?

Before deploying:

1. Change JWT_SECRET in .env
2. Set NODE_ENV=production
3. Update CORS_ORIGIN to your domain
4. Set strong DB_PASSWORD
5. Enable HTTPS
6. Set up proper error logging
7. Create backups
8. Test all features thoroughly

---

## 📞 Support

For issues:
1. Check this guide
2. Review logs in terminal
3. Check browser console (F12)
4. Verify all prerequisites are installed

---

**Setup Complete! Happy coding! 🎉**
