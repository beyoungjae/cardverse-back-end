const Sequelize = require('sequelize')

module.exports = class Qna extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            title: {
               type: Sequelize.STRING(255),
               allowNull: false,
            },
            content: {
               type: Sequelize.TEXT,
               allowNull: false,
            },
            category: {
               type: Sequelize.ENUM('account', 'payment', 'event_coupon', 'site_usage', 'etc'),
               allowNull: true,
            },
            status: {
               type: Sequelize.ENUM(
                  'draft', // 작성중
                  'published', // 공개중
                  'answering', // 답변중 (QnA인 경우)
                  'completed', // 답변완료 (QnA인 경우)
                  'deleted', // 삭제됨
               ),
               allowNull: false,
               defaultValue: 'draft',
            },
            createdAt: {
               type: Sequelize.DATE,
               allowNull: true,
               defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
               type: Sequelize.DATE,
               allowNull: true,
               defaultValue: null,
               onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'Qna',
            tableName: 'qnas',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         },
      )
   }

   static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' })
   }
}
