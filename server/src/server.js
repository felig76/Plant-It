// Cargar variables de entorno desde .env
require('dotenv').config()

// Importar la aplicación Express configurada en app.js
const app = require('./app')

// Puerto en el que va a escuchar el servidor (desde .env)
const PORT = process.env.PORT

// Iniciar el servidor HTTP y escuchar conexiones
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
