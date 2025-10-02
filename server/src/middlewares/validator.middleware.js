exports.validateSchema = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body) // Valida el cuerpo de la solicitud con el esquema proporcionado
        next()
    } catch (error) {
        return res.status(400).json({ error: error.errors.map(error => error.message)}) // Si hay un error de validación, devuelve un error 400 con los mensajes de error})
    }
}