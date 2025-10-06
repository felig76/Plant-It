const mongoose = require('mongoose')

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI)  // Conectar a la base de datos MongoDB usando la URI almacenada en las variables de entorno
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (e) {
        console.error(`Error: ${e.message}`)
        process.exit(1)
    }
}

module.exports = connectDB