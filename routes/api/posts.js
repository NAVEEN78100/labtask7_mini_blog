const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');

function apiAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// GET /api/posts
router.get('/', async (req, res) => {
  const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
  res.json(posts);
});

// GET /api/posts/:id
router.get('/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'username');
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json(post);
});

// POST /api/posts
router.post('/', apiAuth, async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Invalid data' });
  const post = await Post.create({ title, body, author: req.session.user._id });
  res.status(201).json(post);
});

// PUT /api/posts/:id
router.put('/:id', apiAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (post.author.toString() !== req.session.user._id) return res.status(403).json({ error: 'Forbidden' });
  post.title = req.body.title || post.title;
  post.body = req.body.body || post.body;
  post.updatedAt = new Date();
  await post.save();
  res.json(post);
});

// DELETE /api/posts/:id
router.delete('/:id', apiAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (post.author.toString() !== req.session.user._id) return res.status(403).json({ error: 'Forbidden' });
  await post.remove();
  res.json({ success: true });
});

module.exports = router;