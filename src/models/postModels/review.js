const Sequelize = require('sequelize')

module.exports = class Review extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            user_id: {
               type: Sequelize.INTEGER,
               allowNull: false,
               references: {
                  model: 'users',
                  key: 'id'
               }
            },
            rating: {
               type: Sequelize.INTEGER,
               allowNull: false,
               validate: {
                  min: 1,
                  max: 5,
               },
            },
            content: {
               type: Sequelize.TEXT,
               allowNull: false,
            },
            templateType: {
               type: Sequelize.ENUM('wedding', 'invitation', 'newyear', 'gohyeon'),
               allowNull: false,
            },
            status: {
               type: Sequelize.ENUM('active', 'hidden', 'deleted'),
               allowNull: false,
               defaultValue: 'active',
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
            modelName: 'Review',
            tableName: 'reviews',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(models) {
      this.belongsTo(models.Template, {
         foreignKey: 'template_id',
         onDelete: 'CASCADE',
      })
      this.belongsTo(models.User, {
         foreignKey: 'user_id',
         onDelete: 'CASCADE',
      })
      this.belongsTo(models.UserTemplate, { foreignKey: 'user_template_id' })
   }
}
