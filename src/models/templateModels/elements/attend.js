const Sequelize = require('sequelize')

module.exports = class Attend extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                isEnabled: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                attribute: {
                    type: Sequelize.JSON,
                    allowNull: true,
                    comment: '참석 의사',
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'Attend',
                tableName: 'attends',
                paranoid: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            },
        )
    }

    static associate(models) {
        this.belongsTo(models.TemplateSet, { foreignKey: 'template_set_id' })
    }
}