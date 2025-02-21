const Review = require('../models/postModels/review')
const Template = require('../models/postModels/template')

exports.createReview = async (req, res) => {
   try {
      const { templateId, rating, content, templateType } = req.body

      // 템플릿 존재 확인
      const template = await Template.findByPk(templateId)
      if (!template) {
         return res.status(404).json({ message: '템플릿을 찾을 수 없습니다.' })
      }

      const review = await Review.create({
         template_id: templateId,
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
