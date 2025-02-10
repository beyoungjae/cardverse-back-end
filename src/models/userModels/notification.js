const Sequelize = require('sequelize')

module.exports = class Notification extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                type: {
                    type: Sequelize.ENUM('signup', 'eventWinner', 'passwordChange', 'purchaseThankYou', 'couponIssued', 'verificationCode'),
                    allowNull: false,
                },

                content: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },

                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },

                isRead: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'Notification',
                tableName: 'notifications',
                paranoid: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            },
        )
    }
}
