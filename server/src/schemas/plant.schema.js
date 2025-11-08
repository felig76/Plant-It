// Esquema Zod para validar creación/actualización básica de Plant
const { z } = require('zod')

exports.plantSchema = z.object({
    name: z.string({
        required_error: 'The name is required'
    }),
    type: z.string({
        required_error: 'The type is required'
    }),
})