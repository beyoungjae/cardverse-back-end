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
                        // 이미지 순서 조회를 위한 인덱스
                        name: 'idx_post_order', // 포스트용 인덱스 추가
                        fields: ['post_id', 'image_order'],
                    },
                    {
                        name: 'idx_template_order', // 템플릿용 인덱스 추가
                        fields: ['template_id', 'image_order'],
                    },
                ],
            },
        )
    }

    static associate(models) {
        this.belongsTo(models.Post, {
            foreignKey: 'post_id',
            onDelete: 'CASCADE', // 포스트 삭제시 이미지도 삭제
        })

        this.belongsTo(models.Template, {
            foreignKey: 'template_id',
            onDelete: 'CASCADE', // 포스트 삭제시 이미지도 삭제
        })
    }
}
