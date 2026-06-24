const express = require('express');
const ChatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/send', authMiddleware, ChatController.sendMessage);
router.get('/conversation/:userId', authMiddleware, ChatController.getConversation);
router.get('/list', authMiddleware, ChatController.getUserChats);
router.put('/read', authMiddleware, ChatController.markAsRead);
router.get('/unread', authMiddleware, ChatController.getUnreadCount);

module.exports = router;
