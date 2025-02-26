const Sequelize = require('sequelize')

module.exports = class LoginHistory extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            userId: {
               type: Sequelize.INTEGER,
               allowNull: false,
               field: 'user_id', // underscored: true 때문에 필요
            },

            loginType: {
               type: Sequelize.ENUM('kakao', 'local', 'google'),
               allowNull: false,
               defaultValue: 'local',
            },

            ipAddress: {
               type: Sequelize.STRING(45),
               allowNull: false,
            },

            userAgent: {
               type: Sequelize.TEXT,
               allowNull: true,
            },

            loginAt: {
               type: Sequelize.DATE,
               allowNull: false,
               defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'LoginHistory',
            tableName: 'login_histories',
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
