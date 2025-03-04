const express = require('express')
const router = express.Router()
const Template = require('../../models/templateModels/templateSet')
const { auth } = require('../middlewares/auth')

// 템플릿 목록 조회
router.get('/', async (req, res) => {
   try {
      const { type, page = 1, limit = 10 } = req.query
      const offset = (page - 1) * limit

      const where = {}
      if (type) {
         where['templateSet.intro.type'] = type
      }

      const templates = await Template.findAndCountAll({
         where,
         limit: parseInt(limit),
         offset: parseInt(offset),
         order: [['createdAt', 'DESC']],
      })

      res.json({
         templates: templates.rows,
         total: templates.count,
         currentPage: parseInt(page),
         totalPages: Math.ceil(templates.count / limit),
      })
   } catch (error) {
      console.error('템플릿 목록 조회 중 오류가 발생했습니다:', error)
      res.status(500).json({ message: '템플릿 목록 조회 중 오류가 발생했습니다.' })
   }
})

// 템플릿 생성
router.post('/', auth, async (req, res) => {
   try {
      const userId = req.session.userId
      const { templateSet } = req.body

      const template = await Template.create({
         userId,
         templateSet,
      })

      res.status(201).json(template)
   } catch (error) {
      console.error('템플릿 생성 중 오류가 발생했습니다:', error)
      res.status(500).json({ message: '템플릿 생성 중 오류가 발생했습니다.' })
   }
})

// 템플릿 상세 조회
router.get('/:templateId', async (req, res) => {
   try {
      const { templateId } = req.params
      const template = await Template.findByPk(templateId)

      if (!template) {
         return res.status(404).json({ message: '템플릿을 찾을 수 없습니다.' })
      }

      res.json(template)
   } catch (error) {
      console.error('템플릿 조회 중 오류가 발생했습니다:', error)
      res.status(500).json({ message: '템플릿 조회 중 오류가 발생했습니다.' })
   }
})

// 템플릿 수정
router.put('/:templateId', auth, async (req, res) => {
   try {
      const userId = req.session.userId
      const { templateId } = req.params
      const { templateSet } = req.body

      const template = await Template.findByPk(templateId)

      if (!template) {
         // 새로운 템플릿 생성
         const newTemplate = await Template.create({
            id: templateId,
            userId,
            templateSet,
         })
         return res.status(201).json(newTemplate)
      }

      // 기존 템플릿 수정
      if (template.userId !== userId) {
         return res.status(403).json({ message: '템플릿을 수정할 권한이 없습니다.' })
      }

      await template.update({ templateSet })
      res.json(template)
   } catch (error) {
      console.error('템플릿 수정 중 오류가 발생했습니다:', error)
      res.status(500).json({ message: '템플릿 수정 중 오류가 발생했습니다.' })
   }
})

// 템플릿 삭제
router.delete('/:templateId', auth, async (req, res) => {
   try {
      const userId = req.session.userId
      const { templateId } = req.params
      const template = await Template.findByPk(templateId)

      if (!template) {
         return res.status(404).json({ message: '템플릿을 찾을 수 없습니다.' })
      }

      if (template.userId !== userId) {
         return res.status(403).json({ message: '템플릿을 삭제할 권한이 없습니다.' })
      }

      await template.destroy()
      res.json({ message: '템플릿이 삭제되었습니다.' })
   } catch (error) {
      console.error('템플릿 삭제 중 오류가 발생했습니다:', error)
      res.status(500).json({ message: '템플릿 삭제 중 오류가 발생했습니다.' })
   }
})

module.exports = router
