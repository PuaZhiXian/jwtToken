const JWT = require('jsonwebtoken')
const createError = require('http-errors')

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                aud: userId,
                iss: 'angular.com'
            }
            const secret = process.env.ACCESS_TOKEN_SECRET
            const option = {
                expiresIn: "1d"
            }
            JWT.sign(payload, secret, option, (err, token) => {
                if (err) {
                    console.log(err.message)
                    reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    verifyAccessToken: (req, res, next) => {
        const {accessToken} = req.cookies
        if (!accessToken) return next(createError.Unauthorized())
        JWT.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                if (err.name === 'JsonWebTokenError') {
                    return next(createError.Unauthorized())
                } else {
                    return next(createError.Unauthorized(err.message))
                }
            }
            req.payload = payload
            next()
        })
    },
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                aud: userId,
                iss: 'angular.com'
            }
            const secret = process.env.REFRESH_TOKEN_SECRET
            const option = {
                expiresIn: "1y"
            }
            JWT.sign(payload, secret, option, (err, token) => {
                if (err) {
                    console.log(err.message)
                    reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                if (err) return reject(createError.Unauthorized())
                const userId = payload.aud
                // check refresh token with the one in db
                resolve(userId)
            })
        })
    },


}