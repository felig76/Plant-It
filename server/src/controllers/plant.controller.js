const Plant = require('../models/plant.js')
const appError = require('../utils/appError.js')
const User = require('../models/user.js')

exports.createPlant = async (req, res, next) => {
    const { name, type, groundHumedity, airHumedity, lightExposure, temperature, batteryLevel, userId } = req.body
    try{
        const newPlant = new Plant({ name, type, groundHumedity, airHumedity, lightExposure, temperature, batteryLevel, userId })
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