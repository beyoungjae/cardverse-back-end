const Sequelize = require('sequelize')

module.exports = class DailyStatistic extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                date: {
                    type: Sequelize.DATEONLY, 
                    allowNull: false,
                    unique: {
                        name: 'idx_date',
                        msg:'이미 기록된 날짜입니다.',
                    },
                    comment: '기록 날짜',
                },
                dailyNewUsers: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                    comment: '신규 가입자 수',
                },
                dailyRevenue: {
                    type: Sequelize.DECIMAL(10, 2),
                    allowNull: false,
                    defaultValue: 0.0,
                    comment: '일일 수익',
                },
                dailyOrders: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                    comment: '주문 건수',
                },
                dailyUniqueVisits: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                    comment: '고유 방문자 수',
                },
                dailyPosts: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                    comment: '작성된 게시글 수',
                },
                dailyErrors: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                    comment: '오류 발생 횟수',
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: true,
                modelName: 'DailyStatistic',
                tableName: 'daily_statistics',
                paranoid: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            },
        )
    }
}
