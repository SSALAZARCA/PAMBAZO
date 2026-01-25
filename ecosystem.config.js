module.exports = {
  apps: [
    {
      name: 'pambaso-backend',
      script: './api/app.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'pambaso',
        DB_USER: 'pambaso_user',
        DB_PASSWORD: 'secure_password',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        REDIS_PASSWORD: 'redis_password',
        JWT_SECRET: 'your-super-secret-jwt-key-change-in-production',
        JWT_EXPIRES_IN: '24h',
        BCRYPT_ROUNDS: 12
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_PORT: process.env.DB_PORT || 5432,
        DB_NAME: process.env.DB_NAME || 'pambaso',
        DB_USER: process.env.DB_USER || 'pambaso_user',
        DB_PASSWORD: process.env.DB_PASSWORD,
        REDIS_HOST: process.env.REDIS_HOST || 'localhost',
        REDIS_PORT: process.env.REDIS_PORT || 6379,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
        BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS || 12
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist'],
      
      // Memory management
      max_memory_restart: '1G',
      
      // Health check
      health_check_grace_period: 3000,
      
      // Advanced settings
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Auto restart on file changes (development only)
      watch_options: {
        followSymlinks: false,
        usePolling: false
      }
    }
  ],
  
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'https://github.com/your-username/pambaso.git',
      path: '/var/www/pambaso',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    },
    staging: {
      user: 'deploy',
      host: ['staging-server-ip'],
      ref: 'origin/develop',
      repo: 'https://github.com/your-username/pambaso.git',
      path: '/var/www/pambaso-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging'
    }
  }
};