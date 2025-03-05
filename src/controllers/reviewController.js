const Review = require('../models/postModels/review')
const Template = require('../models/postModels/template')
const User = require('../models/userModels/user')

exports.createReview = async (req, res) => {
   try {
      const { templateId, rating, content, templateType } = req.body
      const userId = Number(req.session.id) || req.user?.id // 인증된 사용자 ID

      // 템플릿 존재 확인
      const template = await Template.findByPk(templateId)
      if (!template) {
         return res.status(404).json({ message: '템플릿을 찾을 수 없습니다.' })
      }

      const review = await Review.create({
         template_id: templateId,
         user_id: userId,
         rating,
         content,
         templateType,
      })

      res.status(201).json(review)
   } catch (error) {
      res.status(400).json({ message: error.message })
   }
}

exports.getReviews = async (req, res) => {
   try {
      const { templateId } = req.query
      const where = {
         status: 'active',
         ...(templateId && { template_id: templateId }),
      }

      const reviews = await Review.findAll({
         where,
         include: [
            {
               model: Template,
               attributes: ['title', 'category'],
            },
            {
               model: User,
               attributes: ['id', 'nick', 'email'],
            },
         ],
         order: [['created_at', 'DESC']],
      })

      res.json(reviews)
   } catch (error) {
      res.status(500).json({ message: error.message })
   }
}

exports.updateReview = async (req, res) => {
   try {
      const { id } = req.params
      const { rating, content } = req.body

      const review = await Review.findByPk(id)
      if (!review) {
         return res.status(404).json({ message: '리뷰를 찾을 수 없습니다.' })
      }

      await review.update({
         rating,
         content,
      })

      res.json(review)
   } catch (error) {
      res.status(400).json({ message: error.message })
   }
}

exports.deleteReview = async (req, res) => {
   try {
      const { id } = req.params
      const review = await Review.findByPk(id)

      if (!review) {
         return res.status(404).json({ message: '리뷰를 찾을 수 없습니다.' })
      }

      // 실제 삭제가 아닌 상태 변경
      await review.update({ status: 'deleted' })

      res.json({ message: '리뷰가 삭제되었습니다.' })
   } catch (error) {
      res.status(500).json({ message: error.message })
   }
}

// 사용자가 작성한 리뷰 조회
exports.getUserReviews = async (req, res) => {
   try {
      console.log('🔹 요청된 사용자 정보:', req.user) // 디버깅 로그 추가

      if (!req.user || !req.user.id) {
         return res.status(401).json({ message: '사용자 인증이 필요합니다.' })
      }
      const userId = req.user.id

      const reviews = await Review.findAll({
         where: {
            user_id: userId,
            status: 'active',
         },
         include: [
            {
               model: Template,
               attributes: ['id', 'title', 'category'],
            },
            {
               model: User,
               attributes: ['id', 'nick', 'email'],
            },
         ],
         order: [['created_at', 'DESC']],
      })

      res.json(reviews)
   } catch (error) {
      res.status(500).json({ message: error.message })
   }
}
