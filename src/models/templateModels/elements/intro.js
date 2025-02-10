const Sequelize = require('sequelize')

module.exports = class Intro extends Sequelize.Model {
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
                    comment: '메인 화면 정보 (이름, 메인 이미지 등)',
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'Intro',
                tableName: 'intros',
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