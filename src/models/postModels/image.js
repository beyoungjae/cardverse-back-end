const Sequelize = require('sequelize')

module.exports = class Image extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            imageUrl: {
               type: Sequelize.STRING(200),
               allowNull: false,
            },
            imageOrder: {
               type: Sequelize.INTEGER,
               allowNull: true,
               defaultValue: 1,
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
            modelName: 'Image',
            tableName: 'images',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
            indexes: [
               {
                  name: 'idx_post_order',
                  fields: ['post_id', 'image_order'],
               },
               {
                  name: 'idx_template_order',
                  fields: ['template_id', 'image_order'],
               },
               {
                  name: 'idx_gallery_order',
                  fields: ['gallery_id', 'image_order'],
               },
            ],
         }
      )
   }

   static associate(models) {
      this.belongsTo(models.Post, {
         foreignKey: 'post_id',
         onDelete: 'CASCADE',
      })

      this.belongsTo(models.Template, {
         foreignKey: 'template_id',
         onDelete: 'CASCADE',
      })

      this.belongsTo(models.Gallery, {
         foreignKey: 'gallery_id',
         onDelete: 'CASCADE',
      })
   }
}
