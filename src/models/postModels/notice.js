const Sequelize = require('sequelize')

module.exports = class Notice extends Sequelize.Model {
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
               type: Sequelize.ENUM('service', 'promotion', 'policy', 'security', 'emergency'),
               allowNull: true,
            },
            status: {
               type: Sequelize.ENUM(
                  'draft', // 작성중
                  'published', // 공개중
                  'deleted', // 삭제됨
                  'private', // 비공개
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
            modelName: 'Notice',
            tableName: 'notices',
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
