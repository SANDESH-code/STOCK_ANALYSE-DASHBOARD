const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { validateEmail, validatePassword } = require('../utils/validators');
const env = require('../config/env');

class AuthController {
  static async signup(req, res) {
    try {
      const { name, email, password, confirm_password, role } = req.body;

      if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      if (!validatePassword(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
      }

      if (password !== confirm_password) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = await UserModel.create(name, email, hashedPassword, role || 'buyer');

      const token = jwt.sign({ userId, role: role || 'buyer' }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE });
      const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRE });

      res.status(201).json({
        message: 'User registered successfully',
        user: { id: userId, name, email, role: role || 'buyer' },
        token,
        refreshToken
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE });
      const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRE });

      res.json({
        message: 'Login successful',
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
        refreshToken
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token required' });
      }

      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
      const user = await UserModel.findById(decoded.userId);

      const newToken = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE });

      res.json({ token: newToken });
    } catch (error) {
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  }

  static async getMe(req, res) {
    try {
      const user = await UserModel.findById(req.userId);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = AuthController;
