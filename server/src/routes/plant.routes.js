const express = require('express')
const router = express.Router()

const plantController = require('../controllers/plant.controller')
const { validateSchema } = require('../middlewares/validator.middleware')
const { plantSchema } = require('../schemas/plant.schema')
const { authRequired } = require('../middlewares/validateToken') // Importa el middleware de autenticación

router.post('/create', authRequired, validateSchema(plantSchema), plantController.createPlant)
router.get('/get-plants', authRequired, plantController.getPlants)
router.get('/get-plant/:plantId', authRequired, plantController.getPlantById)
router.patch('/update-name/:plantId', authRequired, validateSchema(plantSchema), plantController.updateNamePlant)
router.delete('/delete-plant/:plantId', authRequired, plantController.deletePlant)

module.exports = router