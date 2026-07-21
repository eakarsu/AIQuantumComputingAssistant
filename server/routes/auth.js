const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const authMiddleware = require('../middleware/auth');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await user.validatePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, tenantId: process.env.GOVERNANCE_TENANT_ID, subjectIds: [`actor:user:${user.id}`] },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !name || typeof password !== 'string' || password.length < 12) {
      return res.status(400).json({ error: 'Email, name, and a password of at least 12 characters are required' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({ email, password, name });
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, tenantId: process.env.GOVERNANCE_TENANT_ID, subjectIds: [`actor:user:${user.id}`] },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '24h' }
    );

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'name', 'role', 'createdAt']
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile (name, email)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check email uniqueness if changed
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(400).json({ error: 'Email already in use' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();

    res.json({ id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update password
router.put('/profile/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both currentPassword and newPassword are required.' });
    }
    if (newPassword.length < 12) return res.status(400).json({ error: 'New password must be at least 12 characters.' });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await user.validatePassword(currentPassword);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
