### image_order

-   `post_id`, `template_id`가 같은 상태에서 여러 `image_id`가 존재시
-   각각 1부터 시작해서 인덱싱

### Post 이미지 조회

const postImages = await Image.findAll({
where: { postId: somePostId },
order: [['image_order', 'ASC']]
});

### Template 이미지 조회

const templateImages = await Image.findAll({
where: { templateId: someTemplateId },
order: [['image_order', 'ASC']]
});
