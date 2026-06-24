const express = require('express');
const multer = require('multer');
const path = require('path');
const TicketController = require('../controllers/ticketController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

router.post('/', authMiddleware, upload.single('image'), TicketController.createTicket);
router.get('/', TicketController.getAllTickets);
router.get('/stats', TicketController.getDashboardStats);
router.get('/seller/tickets', authMiddleware, TicketController.getSellerTickets);
router.get('/:id', TicketController.getTicketById);
router.delete('/:id', authMiddleware, TicketController.deleteTicket);

module.exports = router;
