const Sequelize = require('sequelize')

module.exports = class Payment extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                amount: {
                    type: Sequelize.DECIMAL(10, 2),
                    allowNull: false,
                },
                method: {
                    type: Sequelize.ENUM('CREDIT_CARD', 'BANK_TRANSFER'),
                    allowNull: false,
                },
                status: {
                    type: Sequelize.ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'),
                    allowNull: true,
                    defaultValue: 'PENDING',
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: true,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'Payment',
                tableName: 'payments',
                paranoid: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            },
        )
    }

    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' })
        this.belongsTo(models.Template, { foreignKey: 'user_template_id' })
    }
}
