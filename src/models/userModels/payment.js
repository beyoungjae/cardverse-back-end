const Sequelize = require('sequelize')

module.exports = class Payment extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            amount: {
               type: Sequelize.DECIMAL(10, 2),
               allowNull: false,
            },
            method: {
               type: Sequelize.STRING,
               allowNull: false,
            },
            status: {
               type: Sequelize.ENUM('pending', 'completed', 'failed'),
               allowNull: false,
               defaultValue: 'pending',
            },
            createdAt: {
               type: Sequelize.DATE,
               allowNull: true,
               defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'Payment',
            tableName: 'payments',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(models) {
      this.belongsTo(models.User, {
         foreignKey: 'user_id',
         onDelete: 'CASCADE',
      })
      this.belongsTo(models.UserTemplate, {
         foreignKey: 'user_template_id',
         onDelete: 'SET NULL',
      })
   }
}
