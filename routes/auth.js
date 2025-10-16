const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');

// Register page
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// Register handler
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.render('auth/register', { error: 'All fields required' });
  }
  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.render('auth/register', { error: 'User exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hash });
    req.session.user = { _id: user._id.toString(), username: user.username, email: user.email };
    res.redirect('/posts');
  } catch (err) {
    console.error(err);
    res.render('auth/register', { error: 'Server error' });
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// Login handler
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.render('auth/login', { error: 'All fields required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.render('auth/login', { error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.render('auth/login', { error: 'Invalid credentials' });
    req.session.user = { _id: user._id.toString(), username: user.username, email: user.email };
    res.redirect('/posts');
  } catch (err) {
    console.error(err);
    res.render('auth/login', { error: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    res.redirect('/login');
  });
});

module.exports = router;