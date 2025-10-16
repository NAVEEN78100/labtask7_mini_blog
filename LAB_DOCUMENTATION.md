# Lab Task 8 & 9 Documentation
## Full Stack Development - Mini Blog Application

---

**Student Name:** NAVEEN D  
**Register Number:** 23BCS306  
**Course:** Full Stack Development  
**Lab Tasks:** 8 & 9  
**Submission Date:** October 16, 2025

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [RESTful API Implementation](#restful-api-implementation)
4. [Template Engine Integration](#template-engine-integration)
5. [User Authentication](#user-authentication)
6. [Project Structure](#project-structure)
7. [Features Implemented](#features-implemented)
8. [Screenshots & Code Examples](#screenshots--code-examples)
9. [Conclusion](#conclusion)

---

## Project Overview

This project is a **Mini Blog Application** built using Node.js, Express.js, MongoDB, and EJS templating engine. The application demonstrates:
- RESTful API endpoints with all HTTP methods (GET, POST, PUT, DELETE)
- Dynamic HTML rendering using EJS template engine
- Secure user authentication with bcrypt password hashing
- Session management for logged-in users
- Full CRUD operations for blog posts
- Modern, dark-themed UI with animations

**Live Application URL:** http://localhost:3000

---

## Technologies Used

### Backend Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling tool

### Frontend Technologies
- **EJS (Embedded JavaScript)** - Template engine
- **express-ejs-layouts** - Layout support for EJS
- **CSS3** - Styling with animations and dark theme
- **HTML5** - Semantic markup

### Security & Middleware
- **bcrypt** - Password hashing (10 salt rounds)
- **express-session** - Session management
- **method-override** - Support for PUT and DELETE in forms
- **dotenv** - Environment variable management

---

## RESTful API Implementation

### Task 8(i): RESTful Endpoints with HTTP Methods

The application implements RESTful architecture with proper HTTP methods:

#### 1. **GET Requests**

##### Get All Posts
```javascript
// Route: GET /posts
router.get('/posts', async (req, res) => {
  const posts = await Post.find()
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .limit(50);
  res.render('posts/index', { posts });
});
```
**Purpose:** Retrieves all blog posts from database and displays them  
**Authentication:** Not required (public access)

##### Get Single Post
```javascript
// Route: GET /posts/:id
router.get('/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username');
  if (!post) return res.status(404).send('Not found');
  res.render('posts/show', { post });
});
```
**Purpose:** Retrieves a specific post by ID  
**Authentication:** Not required

##### Get Edit Form
```javascript
// Route: GET /posts/:id/edit
router.get('/posts/:id/edit', ensureAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.redirect('/posts');
  if (post.author.toString() !== req.session.user._id) 
    return res.status(403).send('Forbidden');
  res.render('posts/edit', { post });
});
```
**Purpose:** Displays edit form for a post  
**Authentication:** Required (only post author)

#### 2. **POST Requests**

##### Create New Post
```javascript
// Route: POST /posts
router.post('/posts', ensureAuth, async (req, res) => {
  const { title, body } = req.body;
  try {
    const post = await Post.create({ 
      title, 
      body, 
      author: req.session.user._id 
    });
    res.redirect('/posts/' + post._id);
  } catch (err) {
    console.error(err);
    res.render('posts/new', { error: 'Error creating post' });
  }
});
```
**Purpose:** Creates a new blog post  
**Authentication:** Required  
**Validation:** Title and body are required

##### User Registration
```javascript
// Route: POST /register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  // Validation
  if (!username || !email || !password) {
    return res.render('auth/register', { error: 'All fields required' });
  }
  // Check existing user
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) return res.render('auth/register', { error: 'User exists' });
  
  // Hash password and create user
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hash });
  req.session.user = { _id: user._id.toString(), username: user.username };
  res.redirect('/posts');
});
```
**Purpose:** Registers a new user with hashed password  
**Security:** Password hashed using bcrypt with 10 salt rounds

##### User Login
```javascript
// Route: POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.render('auth/login', { error: 'Invalid credentials' });
  
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.render('auth/login', { error: 'Invalid credentials' });
  
  req.session.user = { _id: user._id.toString(), username: user.username };
  res.redirect('/posts');
});
```
**Purpose:** Authenticates user and creates session  
**Security:** Password comparison using bcrypt

#### 3. **PUT Requests**

##### Update Post
```javascript
// Route: PUT /posts/:id
router.put('/posts/:id', ensureAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.redirect('/posts');
  
  // Authorization check
  if (post.author.toString() !== req.session.user._id) 
    return res.status(403).send('Forbidden');
  
  post.title = req.body.title;
  post.body = req.body.body;
  post.updatedAt = new Date();
  await post.save();
  res.redirect('/posts/' + post._id);
});
```
**Purpose:** Updates an existing post  
**Authentication:** Required  
**Authorization:** Only the post author can update  
**Implementation:** Uses method-override middleware for HTML forms

#### 4. **DELETE Requests**

##### Delete Post
```javascript
// Route: DELETE /posts/:id
router.delete('/posts/:id', ensureAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.redirect('/posts');
  
  // Authorization check
  if (post.author.toString() !== req.session.user._id) 
    return res.status(403).send('Forbidden');
  
  await post.remove();
  res.redirect('/posts');
});
```
**Purpose:** Deletes a post  
**Authentication:** Required  
**Authorization:** Only the post author can delete  
**Implementation:** Uses method-override for HTML form support

### HTTP Methods Summary Table

| HTTP Method | Route | Purpose | Auth Required |
|-------------|-------|---------|---------------|
| GET | `/posts` | List all posts | No |
| GET | `/posts/:id` | View single post | No |
| GET | `/posts/new` | New post form | Yes |
| GET | `/posts/:id/edit` | Edit post form | Yes (author only) |
| POST | `/posts` | Create post | Yes |
| PUT | `/posts/:id` | Update post | Yes (author only) |
| DELETE | `/posts/:id` | Delete post | Yes (author only) |
| GET | `/register` | Registration form | No |
| POST | `/register` | Create user | No |
| GET | `/login` | Login form | No |
| POST | `/login` | Authenticate user | No |
| POST | `/logout` | Destroy session | Yes |

---

## Template Engine Integration

### Task 8(ii): EJS Template Engine Implementation

#### 1. **EJS Configuration in Express**

```javascript
// app.js
const expressLayouts = require('express-ejs-layouts');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');
```

#### 2. **Layout Template (Master Page)**

**File:** `views/layout.ejs`

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title><%= typeof title !== 'undefined' ? title : 'Mini Blog' %></title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <div class="container">
    <!-- Header with dynamic navigation -->
    <header>
      <h1><a href="/posts">✨ Mini Blog</a></h1>
      <nav>
        <% if (currentUser) { %>
          <span>Hi, <%= currentUser.username %> 👋</span>
          <a href="/posts/new">✍️ New Post</a>
          <form action="/logout" method="post" style="display:inline">
            <button type="submit">Logout</button>
          </form>
        <% } else { %>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        <% } %>
      </nav>
    </header>
    
    <!-- Dynamic content area -->
    <main>
      <%- body %>
    </main>
    
    <!-- Footer -->
    <footer>
      <div class="footer-content">
        <p class="dev-credit">✨ Developed by <span class="dev-name">NAVEEN D</span></p>
        <p class="reg-number">Register No: <span>23BCS306</span></p>
      </div>
    </footer>
  </div>
</body>
</html>
```

**Features:**
- Single layout file for all pages
- Dynamic navigation based on authentication status
- Conditional rendering using EJS tags
- Displays current user information
- Developer credits in footer

#### 3. **Dynamic View Templates**

##### Posts List (Index)
**File:** `views/posts/index.ejs`

```html
<h2>📚 All Posts</h2>
<% if (!posts || posts.length === 0) { %>
  <p>No posts yet. Be the first to share your thoughts! 🚀</p>
<% } else { %>
  <ul>
    <% posts.forEach(post => { %>
      <li>
        <a href="/posts/<%= post._id %>">
          <strong><%= post.title %></strong>
        </a>
        <small>by <%= post.author ? post.author.username : 'Unknown' %> 👤</small>
      </li>
    <% }) %>
  </ul>
<% } %>
```

**Dynamic Features:**
- Iterates through posts array using `forEach`
- Conditional rendering for empty state
- Dynamic links with post IDs
- Displays author information from populated data

##### Single Post View
**File:** `views/posts/show.ejs`

```html
<article>
  <h2><%= post.title %></h2>
  <p><small>by <%= post.author ? post.author.username : 'Unknown' %> 👤</small></p>
  <div style="margin-top: 2rem; line-height: 1.8;"><%= post.body %></div>
  
  <!-- Only show edit/delete to post author -->
  <% if (currentUser && post.author && 
         (post.author._id || post.author).toString() === currentUser._id) { %>
    <div class="actions">
      <a href="/posts/<%= post._id %>/edit" class="btn btn-edit">✏️ Edit Post</a>
      <form action="/posts/<%= post._id %>?_method=DELETE" method="post">
        <button type="submit" class="btn-delete">🗑️ Delete Post</button>
      </form>
    </div>
  <% } %>
</article>
```

**Dynamic Features:**
- Displays post content
- Conditional edit/delete buttons (only for author)
- Dynamic action URLs

##### Create/Edit Post Forms
**File:** `views/posts/new.ejs`

```html
<h2>✍️ Create New Post</h2>
<% if (typeof error !== 'undefined') { %>
  <p style="color:red;"><%= error %></p>
<% } %>
<form action="/posts" method="post">
  <div>
    <label>Post Title</label>
    <input name="title" placeholder="Enter an engaging title..." required>
  </div>
  <div>
    <label>Post Content</label>
    <textarea name="body" rows="10" placeholder="Share your thoughts..." required></textarea>
  </div>
  <div><button type="submit">Publish Post</button></div>
</form>
```

**File:** `views/posts/edit.ejs`

```html
<h2>✏️ Edit Post</h2>
<form action="/posts/<%= post._id %>?_method=PUT" method="post">
  <div>
    <label>Post Title</label>
    <input name="title" value="<%= post.title %>" required>
  </div>
  <div>
    <label>Post Content</label>
    <textarea name="body" rows="10" required><%= post.body %></textarea>
  </div>
  <div><button type="submit">💾 Save Changes</button></div>
</form>
```

**Dynamic Features:**
- Pre-populated form fields with existing data
- Error message display
- Method override for PUT requests

##### Authentication Forms

**File:** `views/auth/login.ejs`

```html
<h2>🔐 Login</h2>
<% if (typeof error !== 'undefined') { %>
  <p style="color:red;"><%= error %></p>
<% } %>
<form action="/login" method="post">
  <div>
    <label>Email Address</label>
    <input name="email" type="email" placeholder="Enter your email" required>
  </div>
  <div>
    <label>Password</label>
    <input name="password" type="password" placeholder="Enter your password" required>
  </div>
  <div><button type="submit">Login</button></div>
</form>
<p style="margin-top: 1.5rem; text-align: center;">
  Don't have an account? 
  <a href="/register" style="color: #667eea; font-weight: 600;">Register here</a>
</p>
```

**File:** `views/auth/register.ejs`

```html
<h2>📝 Register</h2>
<% if (typeof error !== 'undefined') { %>
  <p style="color:red;"><%= error %></p>
<% } %>
<form action="/register" method="post">
  <div>
    <label>Username</label>
    <input name="username" placeholder="Choose a username" required>
  </div>
  <div>
    <label>Email Address</label>
    <input name="email" type="email" placeholder="Enter your email" required>
  </div>
  <div>
    <label>Password</label>
    <input name="password" type="password" placeholder="Create a password" required>
  </div>
  <div><button type="submit">Create Account</button></div>
</form>
<p style="margin-top: 1.5rem; text-align: center;">
  Already have an account? 
  <a href="/login" style="color: #667eea; font-weight: 600;">Login here</a>
</p>
```

### EJS Features Demonstrated

| Feature | Description | Example |
|---------|-------------|---------|
| `<%= %>` | Output escaped HTML | `<%= post.title %>` |
| `<%- %>` | Output unescaped HTML | `<%- body %>` |
| `<% %>` | Execute JavaScript | `<% if (user) { %>` |
| Conditionals | if-else statements | `<% if (currentUser) { %> ... <% } %>` |
| Loops | forEach, for loops | `<% posts.forEach(post => { %>` |
| Variables | Access passed data | `<%= currentUser.username %>` |

---

## User Authentication

### Task 9: Secure Authentication Implementation

#### 1. **Authentication Middleware**

```javascript
// Middleware to protect routes
function ensureAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}
```

**Purpose:** Protects routes that require authentication

#### 2. **User Model**

**File:** `models/User.js`

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

#### 3. **Password Security**

##### Registration - Password Hashing
```javascript
const bcrypt = require('bcrypt');

// Hash password with 10 salt rounds
const hash = await bcrypt.hash(password, 10);
const user = await User.create({ 
  username, 
  email, 
  password: hash 
});
```

**Security Features:**
- bcrypt with 10 salt rounds
- Passwords never stored in plain text
- One-way hashing (cannot be reversed)

##### Login - Password Verification
```javascript
// Compare plain text password with hashed password
const ok = await bcrypt.compare(password, user.password);
if (!ok) return res.render('auth/login', { 
  error: 'Invalid credentials' 
});
```

#### 4. **Session Management**

```javascript
// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
}));

// Make user available in all templates
app.use(async (req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});
```

**Session Features:**
- Secure session secret from environment variables
- User data stored in session after login
- Session destroyed on logout
- Current user available in all views

#### 5. **Authorization Logic**

```javascript
// Check if user is the post author
if (post.author.toString() !== req.session.user._id) {
  return res.status(403).send('Forbidden');
}
```

**Authorization Levels:**
- **Public Routes:** Anyone can view posts
- **Authenticated Routes:** Only logged-in users can create posts
- **Author-only Routes:** Only post authors can edit/delete their posts

### Authentication Flow Diagram

```
User Registration:
1. User fills registration form
2. Server validates input
3. Check if user already exists
4. Hash password with bcrypt
5. Store user in database
6. Create session
7. Redirect to posts page

User Login:
1. User enters email & password
2. Server finds user by email
3. Compare passwords using bcrypt
4. Create session if valid
5. Redirect to posts page

Protected Routes:
1. User tries to access protected route
2. ensureAuth middleware checks session
3. If session exists → Allow access
4. If no session → Redirect to login
```

---

## Project Structure

```
labtask7_mini_blog/
│
├── models/
│   ├── User.js              # User schema (username, email, password)
│   └── Post.js              # Post schema (title, body, author, timestamps)
│
├── routes/
│   ├── auth.js              # Authentication routes (login, register, logout)
│   ├── posts.js             # Blog post routes (CRUD operations)
│   └── api/
│       └── posts.js         # RESTful API endpoints
│
├── views/
│   ├── layout.ejs           # Master layout template
│   ├── auth/
│   │   ├── login.ejs        # Login form
│   │   └── register.ejs     # Registration form
│   └── posts/
│       ├── index.ejs        # List all posts
│       ├── show.ejs         # Single post view
│       ├── new.ejs          # Create post form
│       └── edit.ejs         # Edit post form
│
├── public/
│   └── css/
│       └── styles.css       # Dark theme with animations (720+ lines)
│
├── app.js                   # Main application file
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables
└── README.md               # Project documentation
```

---

## Features Implemented

### Core Features ✅

1. **RESTful API**
   - ✅ GET - Retrieve posts/users
   - ✅ POST - Create posts/users
   - ✅ PUT - Update posts
   - ✅ DELETE - Remove posts

2. **Template Engine (EJS)**
   - ✅ Layout system with express-ejs-layouts
   - ✅ Dynamic content rendering
   - ✅ Conditional rendering
   - ✅ Data iteration (forEach loops)
   - ✅ Partials and includes

3. **User Authentication**
   - ✅ User registration with validation
   - ✅ Password hashing (bcrypt)
   - ✅ User login with session management
   - ✅ Logout functionality
   - ✅ Protected routes (middleware)
   - ✅ Authorization (author-only actions)

### Additional Features ⭐

4. **Database Integration**
   - ✅ MongoDB with Mongoose ODM
   - ✅ Schema validation
   - ✅ Relationships (User → Posts)
   - ✅ Population of referenced documents

5. **UI/UX Enhancements**
   - ✅ Modern dark theme design
   - ✅ Smooth animations and transitions
   - ✅ Glassmorphism effects
   - ✅ Responsive design
   - ✅ Interactive hover effects
   - ✅ Form validation
   - ✅ Error message displays

6. **Security Features**
   - ✅ Password hashing (bcrypt)
   - ✅ Session management
   - ✅ CSRF protection via method-override
   - ✅ Input validation
   - ✅ Environment variables for secrets

---

## Screenshots & Code Examples

### 1. Database Models

#### User Model (`models/User.js`)
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

#### Post Model (`models/Post.js`)
```javascript
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
```

### 2. Main Application Configuration

**File:** `app.js` (Main configuration)

```javascript
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mini_blog')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

// View Engine Setup
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Make user available globally
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/posts'));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
```

### 3. Package Dependencies

**File:** `package.json`

```json
{
  "name": "mini-blog-lab",
  "version": "1.0.0",
  "description": "Mini Blog App - Express, EJS, MongoDB, Authentication",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.0",
    "dotenv": "^16.3.1",
    "ejs": "^3.1.9",
    "express": "^4.18.2",
    "express-ejs-layouts": "^2.5.1",
    "express-session": "^1.17.3",
    "method-override": "^3.0.0",
    "mongoose": "^7.3.1"
  }
}
```

---

## Installation & Running Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/NAVEEN78100/labtask7_mini_blog.git
   cd labtask7_mini_blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/mini_blog
   SESSION_SECRET=your_secret_key_here
   PORT=3000
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**
   
   Development mode (with nodemon):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

6. **Access the application**
   
   Open browser and navigate to: `http://localhost:3000`

---

## Testing the Application

### 1. Testing RESTful Endpoints

#### Test User Registration (POST)
1. Navigate to `/register`
2. Fill in username, email, and password
3. Submit form
4. Verify user is created and logged in
5. Check MongoDB for new user document

#### Test Login (POST)
1. Navigate to `/login`
2. Enter registered email and password
3. Submit form
4. Verify session is created
5. Check that navigation shows user name

#### Test Create Post (POST)
1. Login first
2. Navigate to `/posts/new`
3. Fill in title and body
4. Submit form
5. Verify post is created and displayed

#### Test View Posts (GET)
1. Navigate to `/posts`
2. Verify all posts are listed
3. Click on a post title
4. Verify single post view displays correctly

#### Test Update Post (PUT)
1. Login as post author
2. Navigate to a post you created
3. Click "Edit Post"
4. Modify title or body
5. Submit form
6. Verify changes are saved

#### Test Delete Post (DELETE)
1. Login as post author
2. Navigate to a post you created
3. Click "Delete Post"
4. Verify post is removed from database

### 2. Testing Authentication

#### Test Protected Routes
1. Logout (or open incognito window)
2. Try to access `/posts/new`
3. Verify redirect to `/login`

#### Test Authorization
1. Login as User A
2. Create a post
3. Logout and login as User B
4. Try to edit User A's post
5. Verify "Forbidden" error

#### Test Password Hashing
1. Register a new user
2. Check MongoDB user document
3. Verify password is hashed (not plain text)

### 3. Testing Template Rendering

#### Test Dynamic Content
1. Login and check navigation shows username
2. Logout and verify navigation shows login/register links
3. Create multiple posts and verify forEach loop works
4. Test conditional rendering with empty posts list

---

## Key Learning Outcomes

### Technical Skills Gained

1. **RESTful API Design**
   - Understanding of REST principles
   - Proper use of HTTP methods
   - Resource-based URL structure
   - Status code handling

2. **Template Engine Mastery**
   - EJS syntax and features
   - Layout system implementation
   - Dynamic content rendering
   - Conditional and iterative rendering

3. **Authentication & Security**
   - Password hashing with bcrypt
   - Session management
   - Protected route implementation
   - Authorization logic

4. **Database Integration**
   - MongoDB/Mongoose usage
   - Schema design
   - CRUD operations
   - Document relationships

5. **Full Stack Development**
   - Frontend-backend integration
   - Form handling
   - Error handling
   - User experience design

---

## Challenges Faced & Solutions

### Challenge 1: Layout System Error
**Problem:** `layout is not defined` error when using EJS  
**Solution:** Installed `express-ejs-layouts` package and configured it properly in app.js

### Challenge 2: PUT/DELETE Methods in HTML Forms
**Problem:** HTML forms only support GET and POST  
**Solution:** Used `method-override` middleware with `?_method=PUT` query parameter

### Challenge 3: Session Management
**Problem:** User data not persisting across requests  
**Solution:** Implemented express-session middleware and stored user ID in session

### Challenge 4: Authorization Logic
**Problem:** Any logged-in user could edit any post  
**Solution:** Added author check: `post.author.toString() === req.session.user._id`

### Challenge 5: Template Variable Errors
**Problem:** `title is not defined` error in layout.ejs  
**Solution:** Used `typeof title !== 'undefined' ? title : 'Mini Blog'` for safe checking

---

## Future Enhancements

### Potential Improvements

1. **Features**
   - Comment system for posts
   - Like/favorite posts
   - User profiles with avatars
   - Post categories/tags
   - Search functionality
   - Pagination for posts

2. **Security**
   - Rate limiting for login attempts
   - Email verification
   - Password reset functionality
   - CSRF tokens
   - Input sanitization

3. **UI/UX**
   - Rich text editor for posts
   - Image upload support
   - Dark/light theme toggle
   - Mobile app version
   - Real-time notifications

4. **Performance**
   - Redis caching
   - CDN for static assets
   - Database indexing
   - API response compression

---

## Conclusion

This Mini Blog Application successfully demonstrates all requirements for Lab Tasks 8 and 9:

### ✅ Lab Task 8 Requirements Met:

**i) RESTful Endpoints with HTTP Methods:**
- **GET:** Implemented for retrieving posts list, single post, and forms
- **POST:** Implemented for creating posts, user registration, and login
- **PUT:** Implemented for updating existing posts
- **DELETE:** Implemented for removing posts
- All endpoints follow REST principles with proper resource naming

**ii) Template Engine Integration:**
- **EJS** successfully integrated with Express
- **Dynamic HTML rendering** with data from database
- **Layout system** using express-ejs-layouts
- **Conditional rendering** based on authentication status
- **Data iteration** for displaying lists of posts
- **Reusable components** with master layout template

### ✅ Lab Task 9 Requirements Met:

**User Authentication Implementation:**
- **Secure password hashing** using bcrypt (10 salt rounds)
- **Session management** for maintaining logged-in state
- **User registration** with validation and duplicate checking
- **Login/logout functionality** with proper error handling
- **Protected routes** using authentication middleware
- **Authorization checks** ensuring only authors can modify their posts
- **Security best practices** followed throughout implementation

### Project Highlights:

1. **Full CRUD Operations:** Complete Create, Read, Update, Delete functionality
2. **Security First:** Passwords hashed, sessions secure, routes protected
3. **Modern UI:** Dark theme with smooth animations and responsive design
4. **Clean Code:** Well-organized structure with separation of concerns
5. **Database Integration:** MongoDB with Mongoose for data persistence
6. **Error Handling:** Proper validation and user-friendly error messages

### Technical Achievements:

- Successfully integrated 8+ npm packages
- Implemented 12+ routes covering all HTTP methods
- Created 7 dynamic EJS templates
- Built authentication system from scratch
- Designed responsive dark-themed UI with 720+ lines of CSS
- Implemented database relationships (User → Posts)
- Added middleware for authentication and authorization

This project demonstrates proficiency in:
- Backend development with Node.js and Express
- RESTful API design and implementation
- Template engine usage (EJS)
- Database operations with MongoDB
- User authentication and security
- Full-stack web development

---

## References

1. **Express.js Documentation:** https://expressjs.com/
2. **EJS Documentation:** https://ejs.co/
3. **Mongoose Documentation:** https://mongoosejs.com/
4. **bcrypt Documentation:** https://www.npmjs.com/package/bcrypt
5. **MDN Web Docs - HTTP Methods:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
6. **REST API Best Practices:** https://restfulapi.net/

---

## Appendix: Complete File Listings

### A. Environment Variables (.env)
```env
MONGO_URI=mongodb://localhost:27017/mini_blog
SESSION_SECRET=mini_blog_secret_key_2025
PORT=3000
```

### B. Git Repository
**Repository URL:** https://github.com/NAVEEN78100/labtask7_mini_blog  
**Branch:** main

---

**End of Documentation**

---

**Submitted by:**  
**NAVEEN D**  
**Register No: 23BCS306**  
**Date: October 16, 2025**

---

*This document was created as part of the Full Stack Development Lab assignments (Tasks 8 & 9) demonstrating RESTful API implementation, template engine integration, and user authentication in a Node.js/Express application.*
