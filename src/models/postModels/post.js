const Sequelize = require('sequelize')

module.exports = class Post extends Sequelize.Model {
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
            type: {
               type: Sequelize.ENUM('notice', 'review', 'faq', 'qna'),
               allowNull: false,
               comment: '게시판 분류',
            },
            category: {
               type: Sequelize.ENUM('payment', 'template', 'account', 'technical', 'etc'),
               allowNull: true,
               comment: '게시판 = faq / 일 경우 보이는 서브분류',
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
               comment: '게시글 상태',
            },
            viewCount: {
               type: Sequelize.INTEGER,
               allowNull: false,
               defaultValue: 0,
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
            modelName: 'Post',
            tableName: 'posts',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         },
      )
   }

   static associate(models) {
      this.hasMany(models.Image)

      this.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' })
   }
}
