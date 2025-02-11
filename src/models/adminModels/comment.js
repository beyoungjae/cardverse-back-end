const Sequelize = require('sequelize')

module.exports = class Comment extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                content: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                    comment: '관리자 답변 내용',
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
                modelName: 'Comment',
                tableName: 'comments',
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
        this.belongsTo(models.User, {
            foreignKey: 'user_id',
        })

        this.belongsTo(models.Post, {
            foreignKey: 'post_id',
            onDelete: 'CASCADE', // 게시글 삭제시 댓글도 삭제
        })
    }
}
