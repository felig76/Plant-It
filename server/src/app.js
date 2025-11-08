// App HTTP principal con Express
const express = require('express');
// CORS permite que el frontend acceda a este backend desde otro origen
const cors = require('cors');
// Logger de requests en consola para depurar
const morgan = require('morgan');
// Helmet agrega cabeceras de seguridad por defecto
const helmet = require('helmet');
// Lee cookies de las requests (usamos JWT en cookie)
const cookieParser = require('cookie-parser');
// Manejador central de errores (responde JSON uniforme)
const errorHandler = require('./middlewares/errorHandler');
// Carga variables de entorno desde .env
require('dotenv').config();

// Rutas del dominio
const userRoutes = require('./routes/user.routes');
const plantRoutes = require('./routes/plant.routes');
// Conexión a la base de datos MongoDB
const connectDB = require('./config/db');
connectDB();

// Instancia de la app Express
const app = express();

// Si hay un proxy (por ejemplo Render/Heroku), esto ayuda con cookies "secure"
// y la detección correcta de protocolo y IP real del cliente
app.set('trust proxy', 1);

// Endpoint simple para recibir datos de una ESP32 (HTTP JSON)
// Útil para pruebas iniciales. Se puede quitar si no se usa.
app.post('/esp-data', express.json(), (req, res) => {
 console.log('Datos recibidos desde ESP32:', req.body);
 res.status(200).send('OK');
});



// Configuración CORS: define qué orígenes pueden llamar al backend
app.use(cors({
  origin: (origin, callback) => {
    // Permitir llamadas sin header Origin (por ejemplo, dispositivos/ESP32)
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
  // Permitir envío/recepción de cookies (autenticación con JWT en cookie)
  credentials: true,
  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Cabeceras permitidas
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'x-device-id'
  ],
}));

// Middlewares globales
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// Rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/plants', plantRoutes);

// Manejo centralizado de errores (debe ir al final)
app.use(errorHandler);

// Exportar la app para que server.js la levante
module.exports = app;
