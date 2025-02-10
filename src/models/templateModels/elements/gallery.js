const Sequelize = require('sequelize')

module.exports = class Gallery extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                isEnabled: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
                attribute: {
                    type: Sequelize.JSON,
                    allowNull: true,
                    comment: '갤러리',
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'Gallery',
                tableName: 'gallerys',
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
