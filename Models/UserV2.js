const { Sequelize, DataTypes } = require('sequelize')
// Define the student model that creates a table in the `student_database`
const Student = sequelize.define('student', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING
})