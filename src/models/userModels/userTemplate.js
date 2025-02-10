const Sequelize = require('sequelize')

module.exports = class UserTemplate extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                isPaid: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                    comment: '결제 여부',
                },
                status: {
                    type: Sequelize.ENUM('draft', 'active', 'expired', 'deleted'),
                    allowNull: false,
                    defaultValue: 'draft',
                    comment: 'draft: 결제중 / active: 결제완료 / expired: 만료 / deleted: 삭제',
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: true,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: true,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                expriesAt: {
                    type: Sequelize.DATE,
                    allowNull: true,
                    comment: 'draft: updatedAt+30일 / active: paymentDate+90일',
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'UserTemplate',
                tableName: 'user_templates',
                paranoid: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            },
        )
    }

    static associate(models) {
        this.hasOne(models.TemplateSet, { foreignKey: 'user_template_id' })
        this.hasOne(models.Payment, { foreignKey: 'user_template_id' })

        this.belongsTo(models.Template, { foreignKey: 'template_id' })
        this.belongsTo(models.User, { foreignKey: 'user_id' })
    }
}
