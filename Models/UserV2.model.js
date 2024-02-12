const {Sequelize, DataTypes} = require('sequelize')
const bcrypt = require("bcrypt");

const sequelize = require("../helpers/init_sequelize");

// Define the student model that creates a table in the `student_database`
const UserV2Model = sequelize.define('user',
    {
        email: DataTypes.STRING,
        password: DataTypes.STRING
    },
    {
        freezeTableName: true,
        instanceMethods: {
            generateHash(password) {
                return bcrypt.hash(password, bcrypt.genSaltSync(10));
            },
            validPassword: (password) => {
                return bcrypt.compareSync(password, this.password);
            }
        }
    });
UserV2Model.prototype.validPassword = async (password, hash) => {
    return await bcrypt.compareSync(password, hash);
}

module.exports = UserV2Model