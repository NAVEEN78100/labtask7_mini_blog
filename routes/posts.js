const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

function ensureAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}

// List posts
router.get('/posts', async (req, res) => {
  const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 }).limit(50);
  const message = req.session.message;
  delete req.session.message;
  res.render('posts/index', { posts, message });
});

// New form
router.get('/posts/new', ensureAuth, (req, res) => {
  res.render('posts/new');
});

// Create post (from form)
router.post('/posts', ensureAuth, async (req, res) => {
  const { title, body } = req.body;
  try {
    const post = await Post.create({ title, body, author: req.session.user._id });
    res.redirect('/posts/' + post._id);
  } catch (err) {
    console.error(err);
    res.render('posts/new', { error: 'Error creating post' });
  }
});


// Show single
router.get('/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'username');
  if (!post) return res.status(404).send('Not found');
  res.render('posts/show', { post });
});

// Edit form
router.get('/posts/:id/edit', ensureAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.redirect('/posts');
  if (post.author.toString() !== req.session.user._id) return res.status(403).send('Forbidden');
  res.render('posts/edit', { post });
});

// Update (form)
router.put('/posts/:id', ensureAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.redirect('/posts');
  if (post.author.toString() !== req.session.user._id) return res.status(403).send('Forbidden');
  post.title = req.body.title;
  post.body = req.body.body;
  post.updatedAt = new Date();
  await post.save();
  res.redirect('/posts/' + post._id);
});

// Delete
router.delete('/posts/:id', ensureAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.redirect('/posts');
  if (post.author.toString() !== req.session.user._id) return res.status(403).send('Forbidden');
  await post.remove();
  req.session.message = 'Post deleted successfully.';
  res.redirect('/posts');
});

module.exports = router;