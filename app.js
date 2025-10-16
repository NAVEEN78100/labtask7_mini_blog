require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

// DB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_blog';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

// Middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
}));

// Make user available in templates
app.use(async (req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const apiPostRoutes = require('./routes/api/posts');

app.use('/', authRoutes);
app.use('/', postRoutes);
app.use('/api/posts', apiPostRoutes);

app.get('/', (req, res) => {
  res.redirect('/posts');
});

app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT));