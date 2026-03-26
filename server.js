// ===========================
// BACKEND — server.js
// Node.js + Express + PostgreSQL
// ===========================

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(cors({
  origin: '*', // In production, replace * with your GitHub Pages URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// ---- PostgreSQL Connection ----
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render.com's PostgreSQL
  }
});

// ---- Create Table on Startup ----
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Database table ready');
  } catch (err) {
    console.error('Database init error:', err.message);
  }
}

initDB();

// ---- Routes ----

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Chinmay Karthik Portfolio Backend is running!' });
});

// POST /api/contact — Save contact form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // Length checks
  if (name.length > 255 || email.length > 255) {
    return res.status(400).json({ error: 'Name or email too long.' });
  }
  if (message.length > 5000) {
    return res.status(400).json({ error: 'Message too long (max 5000 characters).' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3) RETURNING id, created_at',
      [name, email, message]
    );

    const saved = result.rows[0];
    console.log(`New contact from ${name} (${email}) — ID: ${saved.id}`);

    res.status(201).json({
      success: true,
      message: 'Contact saved successfully!',
      id: saved.id
    });
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ error: 'Failed to save contact. Please try again.' });
  }
});

// GET /api/contacts — View all contacts (you can protect this later)
app.get('/api/contacts', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, message, created_at FROM contacts ORDER BY created_at DESC'
    );
    res.json({ count: result.rowCount, contacts: result.rows });
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
});

// ---- Start Server ----
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/`);
  console.log(`   Contact API:  http://localhost:${PORT}/api/contact\n`);
});
