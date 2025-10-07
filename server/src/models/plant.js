const mongoose = require('mongoose')

const plantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    groundHumedity: { type: Number, required: true },
    airHumedity: { type: Number, required: true },
    lightExposure: { type: Number, required: true },
    temperature: { type: Number, required: true },
    batteryLevel: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    deviceId: { type: String, required: true }
}, { timestamps: true })

const Plant = mongoose.model('Plant', plantSchema)
module.exports = Plant