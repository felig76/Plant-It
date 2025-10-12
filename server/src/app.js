// Importar dependencias
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

const userRoutes = require('./routes/user.routes');
const plantRoutes = require('./routes/plant.routes');
const connectDB = require('./config/db');
connectDB();

const app = express();

// Render y otros PaaS usan proxy HTTPS -> HTTP hacia tu app.
// Esto ayuda con cookies `secure` y detección de esquema.
app.set('trust proxy', 1);

const allowedOrigins = [
  'https://plant-it-1-kb8j.onrender.com', // tu frontend
  'http://localhost:5173' // opcional para desarrollo
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir sin Origin (como las solicitudes de la ESP32)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'https://plant-it-1-kb8j.onrender.com',
      'http://localhost:5173'
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'x-device-id'
  ],
}));

//Middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

//Rutas
app.use('/api/users', userRoutes);
app.use('/api/plants', plantRoutes);

//Manejo de errores
app.use(errorHandler);

module.exports = app;
