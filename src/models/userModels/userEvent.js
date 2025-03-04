const Sequelize = require('sequelize')

module.exports = class UserEvent extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                type: {
                    type: Sequelize.ENUM('attendance', 'purchase', 'review', 'signup'),
                    allowNull: false,
                    comment: 'attendance: 출석 / purchase: 구매 / review: 리뷰 / signup: 회원가입',
                },
                data: {
                    type: Sequelize.JSON,
                    allowNull: false,
                },
                status: {
                    type: Sequelize.ENUM('participating', 'fail', 'win', 'end'),
                    allowNull: false,
                    defaultValue: 'participating',
                    comment: 'participating: 참여중 / fail: 탈락 / win: 당첨 / end: 이벤트 종료',
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                    comment: '참여 일자',
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: true,
                    defaultValue: null,
                    onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
                    comment: '탈락, 당첨, 갱신',
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'UserEvent',
                tableName: 'user_events',
                paranoid: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            },
        )
    }

    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' })
        this.belongsTo(models.Event, { foreignKey: 'event_id' }) 
    }
}
