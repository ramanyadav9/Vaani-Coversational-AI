import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  elevenLabs: {
    apiKey: process.env.API_KEY,
    baseUrl: process.env.BASE_URL || 'https://api.elevenlabs.io',
    phoneNumberId: process.env.YOUR_PHONE_NUMBER_ID,
    phoneNumber: process.env.YOUR_PHONE_NUMBER,
  },
  cors: {
    origin: function (origin, callback) {
      // Allow requests from localhost on any port or no origin (like mobile apps or curl)
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        'http://localhost:3001',  // Add the new Docker port
        'http://192.168.1.188:3001',  // Add the server IP with port
        'http://192.168.1.188'  // Add just the server IP
      ];

      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
};