const Qna = require('../models/postModels/qna')

const models = {
   qna: require('../models/postModels/qna'),
}

class PostService {
   constructor() {}
   async createPost(userId, type, postData) {
      try {
         const Model = models[type]

         const newPost = await Model.create({
            user_id: userId,
            ...postData,
         })

         return newPost
      } catch (error) {
         console.error('게시글 생성 실패:', error.message)
         throw new Error('게시글 생성 중 오류가 발생했습니다.')
      }
   }
}

const postServiceInstance = new PostService()

module.exports = {
   postService: postServiceInstance,
   PostService,
}
