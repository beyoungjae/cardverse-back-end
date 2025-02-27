const Sequelize = require('sequelize')

module.exports = class Event extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                type: {
                    type: Sequelize.ENUM('attendance', 'purchase', 'review', 'signup'),
                    allowNull: false,
                    comment: 'attendance: 출석 / purchase: 구매 / review: 리뷰 / signup: 회원가입',
                },
                title: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                },
                content: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
                startDate: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                endDate: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                isLimited: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                bannerUrl: {
                    type: Sequelize.STRING(200),
                    allowNull: false,
                },
                maxParticipants: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    defaultValue: null,
                    comment: 'null = 무제한',
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'Evnet',
                tableName: 'events',
                paranoid: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            },
        )
    }

    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'user_id' })

        this.hasMany(models.UserEvent, { foreignKey: 'user_event_id' })
    }
}
