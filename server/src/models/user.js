// Modelo Mongoose para User: credenciales básicas y relación con plantas
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, trim: true },  // Trim: elimina los espacios en blanco al principio y al final
    email: { type: String, required: true, unique: true, trim: true},  
    password: { type: String, required: true, trim: true },
    plants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plant' }]
}, { timestamps: true })

const User = mongoose.model('User', userSchema)
module.exports = User