const Sequelize = require('sequelize')

module.exports = class TemplateSet extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            formData: {
               type: Sequelize.TEXT('long'),
               allowNull: true,
               comment: '사용자 커스텀 템플릿 데이터 (JSON 문자열)',
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'TemplateSet',
            tableName: 'template_sets',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(models) {
      this.belongsTo(models.UserTemplate, { foreignKey: 'user_template_id', onDelete: 'CASCADE' })

      this.hasOne(models.BankAccount, { foreignKey: 'template_set_id' })
      this.hasOne(models.Calendar, { foreignKey: 'template_set_id' })

      this.hasOne(models.Gallery, { foreignKey: 'template_set_id' })
      this.hasOne(models.Greeting, { foreignKey: 'template_set_id' })
      this.hasOne(models.Intro, { foreignKey: 'template_set_id' })

      this.hasOne(models.Map, { foreignKey: 'template_set_id' })
      this.hasOne(models.Message, { foreignKey: 'template_set_id' })
      this.hasOne(models.Other, { foreignKey: 'template_set_id' })
   }
}
