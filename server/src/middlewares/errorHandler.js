const errorHandler = (err, req, res, next) => {
    console.log(err)

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    })
}

module.exports = errorHandler