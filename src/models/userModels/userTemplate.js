const Sequelize = require('sequelize')

module.exports = class UserTemplate extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            isPaid: {
               type: Sequelize.BOOLEAN,
               allowNull: false,
               defaultValue: false,
               comment: '결제 여부',
            },
            status: {
               type: Sequelize.ENUM('draft', 'published', 'ended', 'deleted'),
               allowNull: false,
               defaultValue: 'published',
               comment: 'draft: 작성중 / published: 판매중 / ended: 판매종료 / deleted: 삭제',
            },
            formData: {
               type: Sequelize.TEXT('long'),
               allowNull: true,
               comment: '사용자 커스텀 템플릿 데이터 (JSON 문자열)',
            },
            createdAt: {
               type: Sequelize.DATE,
               allowNull: true,
               defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
               type: Sequelize.DATE,
               allowNull: true,
               defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
               onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            expriesAt: {
               type: Sequelize.DATE,
               allowNull: true,
               comment: 'draft: updatedAt+30일 / published: paymentDate+90일 / ended: paymentDate+90일',
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'UserTemplate',
            tableName: 'user_templates',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(models) {
      this.hasOne(models.TemplateSet, { foreignKey: 'user_template_id' })
      this.hasOne(models.Payment, { foreignKey: 'user_template_id' })

      // onDelete: 'CASCADE' 없는 이유: 관리자가 템플릿을 삭제해도 이미 구매한 템플릿의 데이터는 보존시켜야 함
      this.belongsTo(models.Template, { foreignKey: 'template_id' })
      this.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' })
   }
}
