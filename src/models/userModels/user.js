const Sequelize = require('sequelize')

module.exports = class User extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            email: {
               type: Sequelize.STRING(255),
               allowNull: false,
               unique: true,
            },

            password: {
               type: Sequelize.STRING(60),
               allowNull: true,
            },

            nick: {
               type: Sequelize.STRING(50),
               allowNull: false,
               unique: true,
            },

            role: {
               type: Sequelize.ENUM('user', 'admin'),
               allowNull: false,
               defaultValue: 'user',
            },

            lastLogin: {
               type: Sequelize.DATE,
               allowNull: true,
            },

            status: {
               type: Sequelize.ENUM('active', 'inactive', 'suspended'),
               allowNull: false,
               defaultValue: 'active',
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
            deletedAt: {
               type: Sequelize.DATE,
               allowNull: true,
               defaultValue: null,
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'User',
            tableName: 'users',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(models) {
      // OAuth 계정 관계
      if (models.OauthAccount) {
         this.hasMany(models.OauthAccount, { foreignKey: 'user_id' })
      }

      // 다른 관계들
      this.hasMany(models.UserTemplate, { foreignKey: 'user_id' })
      this.hasMany(models.Review, { foreignKey: 'user_id' })
      this.hasMany(models.Comment, { foreignKey: 'user_id' })
      this.hasMany(models.Payment, { foreignKey: 'user_id' })
      this.hasMany(models.LoginHistory, { foreignKey: 'user_id' })
      this.hasMany(models.Notification, { foreignKey: 'user_id' })
      this.hasMany(models.UserCoupon, { foreignKey: 'user_id' })
   }
}
