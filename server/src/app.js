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
  'https://plant-it-l-kb81.onrender.com',
  'http://localhost:5173' // opcional, para pruebas locales
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/plants', plantRoutes);

// Middleware de errores
app.use(errorHandler);

module.exports = app;
