const createError = require("http-errors");
const {verifyRefreshToken, signAccessToken, signRefreshToken} = require("../helpers/jwt_helper");
const {authSchema} = require("../helpers/validation_schema");
const User = require("../Models/User.model");
const UserV2 = require("../Models/UserV2.model");
const cookie = require("cookie-parser")
const sequelize = require("../helpers/init_sequelize");
const bcrypt = require("bcrypt");

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

            sequelize.sync()
                .then(async () => {

                    const user = await UserV2.findOne({
                        where: {email: result.email}
                    })
                    if (!user) throw createError.NotFound(`User not registered`)
                    const isMatch = await user.validPassword(result.password, user.password)
                    if (!isMatch){
                        throw createError.NotFound(`Invalid Password`)
                    }
                    const accessToken = await signAccessToken(user.id)
                    const refreshToken = await signRefreshToken(user.id)
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

                    res.send({message: 'logged'})
                })
                .catch((error) => next(error))
        } catch (error) {
            if (error.isJoi === true) return next(createError.BadRequest("Invalid Username/Password"))
            next(error)
        }

    },
    register: async (req, res, next) => {
        try {
            const result = await authSchema.validateAsync(req.body)

            sequelize.sync()
                .then(async () => {
                    const doesExist = await UserV2.findOne({
                        raw: true,
                        where: {email: result.email}
                    })

                    if (doesExist) throw  createError.Conflict(`${result.email} is registered`)
                    const salt = await bcrypt.genSalt(10)
                    this.password = await bcrypt.hash(result.password, salt)

                    const savedUser = await UserV2.create({
                        email: result.email,
                        password: this.password
                    })
                    const accessToken = await signAccessToken(savedUser.id)
                    const refreshToken = await signRefreshToken(savedUser.id)
                    res.send({accessToken, refreshToken})
                })
                .catch((error) => next(error))
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
            res.cookies("accessToken", null, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 1 day in seconds
                path: '/',
            });

            res.cookies("refreshToken", null, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 365, // 1 year in seconds
                path: '/',
            });
            //DELETE refresh token from db
            res.sendStatus(204)
        } catch (error) {
            next(error)
        }

        res.send('logout route')
    }
}