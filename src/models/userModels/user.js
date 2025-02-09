const Sequelize = require('sequelize')

module.exports = class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                email: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                    unique: true,
                },
            },
            {
                password: {
                    type: Sequelize.STRING(60),
                    allowNull: true,
                },
            },
            {
                nick: {
                    type: Sequelize.STRING(50),
                    allowNull: false,
                    unique: true,
                },
            },
            {
                role: {
                    type: Sequelize.ENUM('user', 'admin'),
                    allowNull: false,
                    defaultValue: 'user',
                },
            },
            {
                lastLogin: {
                    type: Sequelize.DATE,
                    allowNull: true,
                },
            },
            {
                status: {
                    type: Sequelize.ENUM('active', 'inactive', 'suspended'),
                    allowNull: false,
                    defaultValue: 'active',
                },
            },
        )
    }

    static associate(db) {
    }
}
