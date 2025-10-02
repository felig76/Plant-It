const { z } = require('zod')

exports.registerSchema = z.object({
    username: z.string({
        require_error: 'The username is required'
    }),

    email: z.string({
        required_error: 'The email is required'
    }).email({
        message: 'The email is not valid'
    }),

    password: z.string({
        required_error: 'The password is required'
    }).min(6, {
        message: 'The password must be at least 6 characters long'
    })
})

exports.loginSchema = z.object({
    email: z.string({
        required_error: 'The email is required'
    }).email({
        message: 'The email is not valid'
    }),

    password: z.string({
        required_error: 'The password is required'
    }).min(6, {
        message: 'The password must be at least 6 characters long'
    })
})

exports.updateUserNameSchema = z.object({
    username: z.string({
        required_error: 'The username is required'
    })
})
