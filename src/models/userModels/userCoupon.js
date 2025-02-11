const Sequelize = require('sequelize')

module.exports = class UserCoupon extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                isUsed: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                    comment: 'true: 사용 / false: 미사용',
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                    comment: '발급시간',
                },
                expirationDate: {
                    type: Sequelize.DATE,
                    allowNull: true,
                    comment: '쿠폰 만기일 (발급일 + 쿠폰의 expires_at)',
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'UserCoupon',
                tableName: 'user_coupons',
                paranoid: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            },
        )
    }

    static associate(models) {
        this.belongsTo(models.Coupon, { foreignKey: 'coupon_id' })
        this.belongsTo(models.Payment, { foreignKey: 'payment_id', onDelete: 'CASCADE' })
    }
}
