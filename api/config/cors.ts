import { CorsOptions } from 'cors';

const corsConfigurations = {
  development: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
    maxAge: 86400,
  },

  production: {
    origin: [
      'https://pambazo.com',
      'https://www.pambazo.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
    maxAge: 86400,
  },
};

export const getCorsOptions = (): CorsOptions => {
  const env = process.env.NODE_ENV || 'development';
  const config = corsConfigurations[env as keyof typeof corsConfigurations];

  return {
    ...config,
    origin: (origin, callback) => {
      if (!origin || config.origin.includes(origin)) {
        callback(null, true);
      } else if (env === 'development' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  };
};

export default getCorsOptions;
