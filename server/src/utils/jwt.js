const jwt = require('jsonwebtoken')

// Generar el token JWT
function createAccessToken(payload){  // payload: datos que se van a guardar en el token
    // El payload puede ser cualquier objeto, pero generalmente contiene el id del usuario y otros datos relevantes
    return new Promise((resolve, reject) => {  // Devuelve una promesa para manejar el token de forma asíncrona
        // La promesa se resuelve con el token o se rechaza con un error

        // jwt.sign: firma el token con la clave secreta y establece la duración del token
        jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET , { expiresIn: '1h' }, (err, token) => {
            if(err){
                return reject(err)
            }
            resolve(token)
        })
    })
}

module.exports = { createAccessToken }