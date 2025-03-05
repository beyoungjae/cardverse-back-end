const Sequelize = require('sequelize')

module.exports = class Comment extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            content: {
               type: Sequelize.TEXT,
               allowNull: false,
               comment: '관리자 답변 내용',
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
            modelName: 'Comment',
            tableName: 'comments',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
            indexes: [
               {
                  name: 'idx_post_comments',
                  fields: ['post_id'],
               },
            ],
         }
      )
   }

   static associate(models) {
      this.belongsTo(models.User, {
         foreignKey: 'user_id',
      })

      this.belongsTo(models.Post, {
         foreignKey: 'post_id',
         onDelete: 'CASCADE',
      })
   }
}
