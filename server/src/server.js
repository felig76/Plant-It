// Crear variables de entorno
require('dotenv').config()

// Importar la aplicacion
const app = require('./app')

// Definir el puerto
const PORT = process.env.PORT

// Esuchar el puerto
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
