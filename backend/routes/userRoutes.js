const express = require('express');
const UserModel = require('../models/userModel');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    await UserModel.updateProfile(req.userId, req.body);
    res.json({ message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await UserModel.getSellerProfile(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/ratings', async (req, res) => {
  try {
    const ratings = await UserModel.getUserRatings(req.params.id);
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
