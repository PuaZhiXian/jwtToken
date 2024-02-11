const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/init_mysql')
const {verifyAccessToken} = require('./helpers/jwt_helper')

const AuthRoute = require('./Routes/Auth.route')
const cors = require('cors');
const cookies = require("cookie-parser");

const app = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookies());

const corsOptions = {
    origin: 'http://localhost:4200',
    credentials: true,
};
app.use(cors(corsOptions));


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

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});


