const Qna = require('../models/postModels/qna')
const Notice = require('../models/postModels/notice')

const models = {
   qna: require('../models/postModels/qna'),
   notice: require('../models/postModels/notice'),
}

class PostService {
   constructor() {}
   async createPost(userId, type, postData) {
      try {
         const Model = models[type]

         const newPost = await Model.create({
            user_id: userId,
            ...postData,
            ...(type !== 'qna' && { isPrivate: undefined }),
         })

         return newPost
      } catch (error) {
         console.error('게시글 생성 실패:', error.message)
         throw new Error('게시글 생성 중 오류가 발생했습니다.')
      }
   }

   async getPosts(types, limit) {
      try {
         // 배열형이 아니여도 배열로 만듬
         const typeArray = Array.isArray(types) ? types : [types]

         // 🛠️ limit이 숫자가 아닌 경우 숫자로 변환
         const numericLimit = Number(limit)
         if (isNaN(numericLimit)) {
            throw new Error('❌ 유효하지 않은 limit 값')
         }

         const postPromises = typeArray
            .map((type) => {
               const Model = models[type]
               if (!Model) {
                  console.warn('⚠️ 존재하지 않는 Model:', type)
                  return null
               }
               return Model.findAll({
                  limit: numericLimit,
                  order: [['createdAt', 'DESC']],
                  raw: true,
               }).then((posts) => ({ [type]: posts }))
            })
            .filter(Boolean)

         const postsArray = await Promise.all(postPromises)

         const categorizedPosts = Object.assign({}, ...postsArray)

         //  const allPosts = postsArray.flat()

         return categorizedPosts
      } catch (error) {
         console.error('❌ 게시글 조회 실패:', error.message)
         throw new Error('게시글 조회 중 오류가 발생했습니다.')
      }
   }
}

const postServiceInstance = new PostService()

module.exports = {
   postService: postServiceInstance,
   PostService,
}
