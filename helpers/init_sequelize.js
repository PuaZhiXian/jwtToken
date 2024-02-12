const {Sequelize} = require('sequelize');
const {env} = require("process");

// Create an instance of sequelize
const sequelize =
    new Sequelize(
        env.DATABASE_NAME,
        env.DATABASE_USERNAME,
        env.DATABASE_PASSWORD, {
            host: env.DATABASE_HOST,
            port: env.DATABASE_PORT,
            dialect: 'mysql'
        })

// Validate and connect to the database
sequelize
    .authenticate()
    .then(() => console.log('Successfully connected to the database!'))
    .catch((error) => console.log('Failed to connect the database:', error))

// module.exports = sequelize