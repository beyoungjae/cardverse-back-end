const Sequelize = require('sequelize')

module.exports = class Template extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            title: {
               type: Sequelize.STRING(100),
               allowNull: false,
            },
            thumbnail: {
               type: Sequelize.STRING(255),
               allowNull: false,
            },
            category: {
               type: Sequelize.ENUM('wedding', 'invitation', 'newyear', 'gohyeon'),
               allowNull: false,
            },
            content: {
               type: Sequelize.TEXT,
               allowNull: true,
            },
            price: {
               type: Sequelize.DECIMAL(10, 2),
               allowNull: false,
               defaultValue: 10000,
            },
            data: {
               type: Sequelize.JSON,
               allowNull: false,
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
            status: {
               type: Sequelize.ENUM(
                  'draft', // 작성중
                  'published', // 판매중
                  'ended', // 판매종료
                  'deleted' // 삭제됨
               ),
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'Template',
            tableName: 'templates',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id' }) // 관리자 작성이니 CASCADE 설정x
      this.hasMany(models.UserTemplate, { foreignKey: 'template_id' })
      this.hasMany(models.Images, { foreignKey: 'template_id' })
   }
}
