const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config({
  path: '.env.local' 
});

const { PrismaClient } = require('@prisma/client');
const { verifyPassword, hashPassword } = require('./auth-utils');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Serve static files from static directory
app.use('/static', express.static(path.join(__dirname, 'static')));

// Serve static HTML files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Routes

// MBTA API Key endpoint
app.get('/keys/mbta', (req, res) => {
  const apiKey = process.env.MBTA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'MBTA API key not configured' });
  }
  res.set('Content-Type', 'text/plain');
  res.send(apiKey);
});

// SVG line endpoints
app.get('/line-:color-:degrees.svg', (req, res) => {
  const { color, degrees } = req.params;
  // Import the JavaScript icons module
  const { toLine } = require('./icons');
  
  try {
    const svg = toLine(color, parseInt(degrees));
    res.set('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    res.status(400).json({ error: 'Invalid SVG parameters' });
  }
});

app.get('/line-:color1-:degrees1--:color2-:degrees2.svg', (req, res) => {
  const { color1, degrees1, color2, degrees2 } = req.params;
  // Import the JavaScript icons module
  const { toLines } = require('./icons');
  
  try {
    const svg = toLines(color1, parseInt(degrees1), color2, parseInt(degrees2));
    res.set('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    res.status(400).json({ error: 'Invalid SVG parameters' });
  }
});

// API Routes

// Get all events
app.get('/events', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        datetime: 'desc'
      }
    });
    
    const serializedPosts = posts.map(post => ({
      org: post.org,
      title: post.title,
      stop_key: post.stopKey,
      datetime: post.datetime
    }));
    
    res.json(serializedPosts);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create new event (requires authentication)
app.post('/event', requireAuth, async (req, res) => {
  try {
    const { org, title, stop_key, datetime } = req.body;
    
    if (!title || !stop_key) {
      return res.status(400).json({ error: 'Title and stop_key are required' });
    }
    
    const post = await prisma.post.create({
      data: {
        org: org || '',
        title,
        stopKey: stop_key,
        datetime: datetime ? new Date(datetime) : new Date()
      }
    });
    
    res.status(201).json({ message: 'Posted' });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Authentication routes

// Login
app.post('/accounts/login/', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password using Django-compatible authentication
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (isValidPassword) {
      req.session.userId = user.id;
      req.session.username = user.username;
      res.json({ success: true, user: { username: user.username } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
app.post('/accounts/logout/', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// Register
app.post('/accounts/register/', async (req, res) => {
  try {
    const { username, email, password, confirmation } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    if (password !== confirmation) {
      return res.status(400).json({ error: 'Passwords must match' });
    }
    
    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    // Hash password using bcrypt
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isActive: true,
        isStaff: false,
        isSuperuser: false,
        firstName: '',
        lastName: '',
        dateJoined: new Date()
      }
    });
    
    // Log in the user
    req.session.userId = user.id;
    req.session.username = user.username;
    
    res.json({ success: true, user: { username: user.username } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Serve login page
app.get('/accounts/login/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Serve register page
app.get('/accounts/register/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/register.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the application`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
}); 
