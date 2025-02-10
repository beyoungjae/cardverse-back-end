const Sequelize = require('sequelize')

module.exports = class Greeting extends Sequelize.Model {
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
                    comment: '인사말, 결혼/초대 상세 정보',
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'Greeting',
                tableName: 'greetings',
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