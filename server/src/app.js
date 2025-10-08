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

const allowedOrigins = [
  'https://plant-it-1-kb8j.onrender.com', // tu frontend
  'http://localhost:5173' // opcional para desarrollo
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
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
