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
            detailImages: {
               type: Sequelize.JSON,
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
                  'draft', 
                  'published', 
                  'ended',
                  'deleted'
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
      this.belongsTo(models.User, { foreignKey: 'user_id' }) /
      this.hasMany(models.UserTemplate, { foreignKey: 'template_id' })
      this.hasMany(models.Image, { foreignKey: 'template_id' })
   }
}
