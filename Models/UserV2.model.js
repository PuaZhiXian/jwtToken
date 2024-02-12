const { Sequelize, DataTypes } = require('sequelize')

const sequelize = require("../helpers/init_sequelize");

// Define the student model that creates a table in the `student_database`
const UserV2Model = sequelize.define('user', {
    email: DataTypes.STRING,
    password: DataTypes.STRING
})

module.exports = UserV2Model