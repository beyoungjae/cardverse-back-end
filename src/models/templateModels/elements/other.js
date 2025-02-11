const Sequelize = require('sequelize')

module.exports = class Other extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                isEnabled: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                    validate: {
                        isTrue(value) {
                            if (value !== true) {
                                throw new Error('isEnabled must be TRUE')
                            }
                        },
                    },
                },
                attribute: {
                    type: Sequelize.JSON,
                    allowNull: true,
                    comment: '푸터 (공유하기 등)',
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'Other',
                tableName: 'others',
                paranoid: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            },
        )
    }

    static associate(models) {
        this.belongsTo(models.TemplateSet, { foreignKey: 'template_set_id', onDelete: 'CASCADE' })
    }
}