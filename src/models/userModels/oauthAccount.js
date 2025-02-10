const Sequelize = require('sequelize')

module.exports = class OauthAccount extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                provider: {
                    type: Sequelize.ENUM('local', 'kakao', 'google', 'naver'),
                    allowNull: false,
                },

                providerUserId: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                },

                accessToken: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                refreshToken: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                tokenExpiresAt: {
                    type: Sequelize.DATE,
                    allowNull: true,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                    onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'OauthAccount',
                tableName: 'oauth_accounts',
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
