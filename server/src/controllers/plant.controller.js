const Plant = require('../models/plant.js')
const appError = require('../utils/appError.js')
const User = require('../models/user.js')

exports.createPlant = async (req, res, next) => {
    const { name, type, groundHumedity, airHumedity, lightExposure, temperature, batteryLevel, userId, deviceId } = req.body
    try{
        const newPlant = new Plant({ name, type, groundHumedity, airHumedity, lightExposure, temperature, batteryLevel, userId, deviceId })
        const user = await User.findById(userId)
        if (!user) {
            return next(new appError('User not found', 404))
        }

        user.plants.push(newPlant._id)

        await newPlant.save()
        await user.save()

        res.status(201).json({ newPlant })
    } catch (e) {
        next(e)
    }
}

// Public ingest endpoint for ESP32 devices.
// It validates using the plant's stored deviceId and updates latest measurements.
exports.ingestTelemetry = async (req, res, next) => {
    const { plantId } = req.params
    const {
        groundHumedity,
        airHumedity,
        lightExposure,
        temperature,
        batteryLevel,
        deviceId: bodyDeviceId,
    } = req.body || {}

    try {
        const plant = await Plant.findById(plantId)
        if (!plant) {
            throw new appError('Plant not found', 404)
        }

        // Prefer header, fallback to body
        const providedDeviceId = req.headers['x-device-id'] || bodyDeviceId
        if (!providedDeviceId || providedDeviceId !== plant.deviceId) {
            throw new appError('Invalid deviceId', 401)
        }

        if (
            [groundHumedity, airHumedity, lightExposure, temperature, batteryLevel].some(
                (v) => typeof v !== 'number'
            )
        ) {
            throw new appError('Invalid telemetry payload', 400)
        }

        plant.groundHumedity = groundHumedity
        plant.airHumedity = airHumedity
        plant.lightExposure = lightExposure
        plant.temperature = temperature
        plant.batteryLevel = batteryLevel
        await plant.save()

        res.status(200).json({ success: true })
    } catch (e) {
        next(e)
    }
}

exports.getPlants = async (req, res, next) => {
    const userId = req.user.id
    try{
        const plants = await Plant.find({ userId })
        res.status(200).json({ plants })
    } catch (e) {
        next(e)
    }
}

exports.getPlantById = async (req, res, next) => {
    const { plantId } = req.params
    const userId = req.user.id
    try{
        const plant = await Plant.findById(plantId)
        if (!plant) {
            throw new appError('Plant not found', 404)
        }
        if (plant.userId.toString() !== userId) {
            throw new appError('You are not authorized to access this plant', 401)
        }
        res.status(200).json({ plant })
    } catch (e) {
        next(e)
    }
}

exports.updateNamePlant = async (req, res, next) => {
    const { plantId } = req.params
    const { name } = req.body
    const userId = req.user.id
    try{

        const plant = await Plant.findById(plantId)
        if (!plant) {
            throw new appError('Plant not found', 404)
        }
        if (plant.userId.toString() !== userId) {
            throw new appError('You are not authorized to update this plant', 401)
        }

        plant.name = name
        await plant.save()

        res.status(200).json({ plant })
    } catch (e) {
        next(e)
    }
}
exports.deletePlant = async(req, res, next) => {
    const { plantId } = req.params
    const userId = req.user.id
    try{
        // Find first to verify existence and ownership
        const plant = await Plant.findByIdAndDelete(plantId)
        if (!plant) {
            throw new appError('Plant not found', 404)
        }
        if (plant.userId?.toString() !== userId) {
            throw new appError('You are not authorized to delete this plant', 401)
        }

        await User.findByIdAndUpdate(userId, { $pull: { plants: plant._id } })

        res.status(200).json({ success: true, message: 'Plant deleted', plantId })
    } catch (e) {
        next(e)
    }
  }