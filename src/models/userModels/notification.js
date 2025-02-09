const Sequelize = require('sequelize')

module.exports = class Notification extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                type: {
                    type: Sequelize.ENUM('signup', 'eventWinner', 'passwordChange', 'purchaseThankYou', 'couponIssued'),
                    allowNull: false,
                },
            },
            {
                content: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
            },
            {
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
            },
            {
                sequelize,
                timestamps: false, //createAt, updateAt ..등 자동 생성
                underscored: false,
                modelName: 'User',
                tableName: 'users',
                paranoid: false, //deleteAt 사용 X
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            },
        )
    }
}
