const createError = require("http-errors");
const {verifyRefreshToken, signAccessToken, signRefreshToken} = require("../helpers/jwt_helper");
const {authSchema} = require("../helpers/validation_schema");
const User = require("../Models/User.model");
const cookie = require("cookie-parser")


module.exports = {
    refreshToken: async (req, res, next) => {

        try {
            const {refreshToken} = req.body
            if (!refreshToken) throw createError.BadRequest()

            const userId = await verifyRefreshToken(refreshToken)

            const accessToken = await signAccessToken(userId)
            const refToken = await signRefreshToken(userId)

            res.send({accessToken: accessToken, refreshToken: refToken})

        } catch (error) {
            next(error)
        }

        res.send('refresh token route')
    },
    login: async (req, res, next) => {
        try {
            const result = await authSchema.validateAsync(req.body)
            const user = await User.findOne({email: result.email})
            if (!user) throw createError.NotFound(`User not registered`)

            const isMatch = await user.isValidPassword(result.password)
            if (!isMatch) throw createError.Unauthorized('Username/Password invalid')

            const accessToken = await signAccessToken(user.id)
            const refreshToken = await signRefreshToken(user.id)

            // const serializedAccessToken = cookie.serialize('accessToken', accessToken, {
            //     httpOnly: true,
            //     secure: true,
            //     sameSite: 'strict',
            //     maxAge: 60 * 60 * 24, // 1 day in seconds
            //     path: '/',
            // });
            //
            // const serializedRefreshToken = cookie.serialize('refreshToken', refreshToken, {
            //     httpOnly: true,
            //     secure: true,
            //     sameSite: 'strict',
            //     maxAge: 60 * 60 * 24 * 365,
            //     path: '/',
            // });

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 1 day in seconds
                path: '/',
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 365, // 1 year in seconds
                path: '/',
            });

            // res.setHeader('Set-Cookie', [serializedAccessToken, serializedRefreshToken]);
            res.send({message:'logged'})
        } catch (error) {
            if (error.isJoi === true) return next(createError.BadRequest("Invalid Username/Password"))
            next(error)
        }

    },
    register: async (req, res, next) => {
        try {
            const result = await authSchema.validateAsync(req.body)

            const doesExist = await User.findOne({email: result.email})
            if (doesExist) throw  createError.Conflict(`${result.email} is registered`)

            const user = new User(result)
            const savedUser = await user.save()
            const accessToken = await signAccessToken(savedUser.id)
            const refreshToken = await signRefreshToken(savedUser.id)

            res.send({accessToken, refreshToken})
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    logout: async (req, res, next) => {
        try {
            const {refreshToken} = req.body
            if (!refreshToken) throw  createError.BadRequest()
            const userId = await verifyRefreshToken(refreshToken)
            //DELETE refresh token from db
            res.sendStatus(204)
        } catch (error) {
            next(error)
        }

        res.send('logout route')
    }
}