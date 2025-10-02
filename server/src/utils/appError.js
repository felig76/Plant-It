class appError extends Error{
    constructor(message, statusCode){ 
        super(message)  

        this.statusCode = statusCode
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)  // captureStrackTrace: Este método estático de la clase Error se utiliza para crear una traza de pila (stack trace) de un error. Esto es útil para depurar errores y entender dónde ocurrieron en el código.
        // El primer argumento es el objeto de error que se va a capturar, y el segundo argumento es la función constructora que se está utilizando para crear el error. En este caso, se está utilizando this.constructor, que se refiere a la clase appError.
    }
}

module.exports = appError