const Sequelize = require('sequelize')

module.exports = class VerificationCode extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                verificationCode: {
                    type: Sequelize.STRING(10),
                    allowNull: false,
                },
                expiresAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP + INTERVAL 3 MINUTE'), // ✅ 기본값: 현재 시간 + 3분
                },
                status: {
                    type: Sequelize.ENUM('PENDING', 'VERIFIED', 'EXPIRED'),
                    allowNull: false,
                    defaultValue: 'PENDING',
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'VerificationCode',
                tableName: 'verification_codes',
                paranoid: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            },
        )
    }

    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' })
    }
}
