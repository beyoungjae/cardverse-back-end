const express = require('express')
const router = express.Router()
const Review = require('../models/postModels/review')
const Template = require('../models/postModels/template')
const { createReview, getReviews, updateReview, deleteReview } = require('../controllers/reviewController')

// 리뷰 작성
router.post('/', createReview)

// 리뷰 목록 조회 (템플릿별)
router.get('/template/:templateId', async (req, res) => {
   try {
      const reviews = await Review.findAll({
         where: {
            template_id: req.params.templateId,
            status: 'active', // 활성 리뷰만 조회
         },
         order: [['created_at', 'DESC']],
         include: [
            {
               model: Template,
               attributes: ['title', 'category'],
            },
         ],
      })
      res.json(reviews)
   } catch (error) {
      res.status(500).json({ message: error.message })
   }
})

// 전체 리뷰 목록
router.get('/', getReviews)

// 리뷰 수정
router.put('/:id', updateReview)

// 리뷰 삭제
router.delete('/:id', deleteReview)

module.exports = router
