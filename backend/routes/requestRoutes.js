const express = require('express');
const RequestController = require('../controllers/requestController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, RequestController.createRequest);
router.get('/my-requests', authMiddleware, RequestController.getMyRequests);
router.get('/received', authMiddleware, RequestController.getReceivedRequests);
router.get('/:id', authMiddleware, RequestController.getRequestById);
router.put('/:id', authMiddleware, RequestController.updateRequestStatus);

module.exports = router;
