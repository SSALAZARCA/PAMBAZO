const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: '31.97.128.11',
  port: 5432,
  database: 'pambaso_db',
  user: 'pambaso_user',
  password: 'pambaso123'
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'connected',
      dbTime: result.rows[0].now
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Test login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password });
    
    // Query user from database
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Email o contraseña incorrectos'
      });
    }
    
    const user = result.rows[0];
    console.log('User found:', user);
    
    // For testing, accept any password for now
    if (password === '123456' || password === user.password) {
      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token: 'test-token-123'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Email o contraseña incorrectos'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
});