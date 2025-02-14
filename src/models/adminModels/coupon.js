const Sequelize = require('sequelize')

module.exports = class Coupon extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                label: {
                    type: Sequelize.STRING(100),
                    allowNull: false,
                },
                type: {
                    type: Sequelize.ENUM('PERCENT', 'FIXED'),
                    allowNull: false,
                },
                discount: {
                    type: Sequelize.DECIMAL(10, 2),
                    allowNull: false,
                },
                validityDays: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: '쿠폰 유효 기간(일)',
                },
                minPurchase: {
                    type: Sequelize.DECIMAL(10, 2),
                    allowNull: false,
                    defaultValue: 0,
                },
                maxDiscount: {
                    type: Sequelize.DECIMAL(10, 2),
                    allowNull: false,
                    defaultValue: 0,
                },
                isActive: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'Coupon',
                tableName: 'coupons',
                paranoid: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            },
        )
    }

    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'user_id' })

        this.hasMany(models.UserCoupon, { foreignKey: 'coupon_id' })
    }
}
