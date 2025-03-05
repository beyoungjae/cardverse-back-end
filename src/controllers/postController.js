const { postService } = require('../services/postService')

exports.createPost = async (req, res, next) => {
   try {
      const { type, postData } = req.body
      const userId = req.session.userId

      const createPost = await postService.createPost(userId, type, postData)

      return res.status(200).json(createPost)
   } catch (error) {
      console.error('게시글 등록 중 에러 발생:', error)
      res.status(500).json({
         success: false,
         message: '게시글 등록 중 오류가 발생했습니다.',
      })
   }
}

exports.getPosts = async (req, res, next) => {
   try {
      let { types, limit } = req.query

      const allPosts = await postService.getPosts(types, limit)

      return res.status(200).json({
         success: true,
         message: '전체 게시글 조회에 성공했습니다.',
         posts: allPosts,
      })
   } catch (error) {
      console.error('전체 게시글 조회 중 에러 발생:', error)
      res.status(500).json({
         success: false,
         message: '전체 게시글 조회 중 오류가 발생했습니다.',
      })
   }
}
