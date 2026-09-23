require('dotenv').config();
const express = require('express');
const cors = require('cors');  // It works through special HTTP headers and is essential when your frontend (say, hosted on domain-a.com) needs to fetch data from another server (domain-b.com). Without CORS, browsers block such requests due to the same-origin policy.
const helmet = require('helmet');   //elmet is a Node.js middleware for Express that helps secure your app by setting various HTTP headers automatically. Think of it as a "security helmet" for your server.
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resumes', require('./routes/resumes'));
app.use('/api/analyses', require('./routes/analyses'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/profile', require('./routes/profile'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`);
  res.status(500).json({ error: 'Server error', message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

