//External
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors');
const cookies = require("cookie-parser");

// Local
require('./helpers/init_mysql')
require('./helpers/init_sequelize')
const {verifyAccessToken} = require('./helpers/jwt_helper')
const AuthRoute = require('./Routes/Auth.route')
const createError = require('http-errors')
const PORT = process.env.PORT

const app = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookies());

app.get('/', verifyAccessToken, async (req, res, next) => {
    res.send({message: "Hello world"})
})

app.use('/auth', AuthRoute)

app.use(async (req, res, next) => {
    next(createError(404, 'This route does not exists'))
})


app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
        }
    })
})


app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});


