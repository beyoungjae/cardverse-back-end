const Sequelize = require('sequelize')

module.exports = class BankAccount extends Sequelize.Model {
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
                    comment: '계좌번호',
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'BankAccount',
                tableName: 'bank_accounts',
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