const Sequelize = require('sequelize')

module.exports = class Message extends Sequelize.Model {
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
                    comment: '메세지 기능',
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'Message',
                tableName: 'messages',
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