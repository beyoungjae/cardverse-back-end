const Sequelize = require('sequelize')

module.exports = class BackupTemplate extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                userId: {
                    type: Sequelize.BIGINT,
                    allowNull: false,
                },
                userTemplateId: {
                    type: Sequelize.BIGINT,
                    allowNull: false,
                },
                backupData: {
                    type: Sequelize.JSON,
                    allowNull: false,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'BackupTemplate',
                tableName: 'backup_templates',
                paranoid: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            },
        )
    }
}
