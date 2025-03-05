const express = require('express')
const router = express.Router()
const Template = require('../models/postModels/template')

const { createTemplate, getTemplates, getTemplateById, updateTemplate, deleteTemplate, upload } = require('../controllers/templateController')

// 템플릿 생성
router.post('/', upload, async (req, res) => {
   try {
      // createTemplate 함수 내부에서 파일 및 텍스트 필드 파싱 후 처리
      await createTemplate(req, res)
   } catch (error) {
      res.status(400).json({ message: error.message })
   }
})

// 템플릿 목록 조회
router.get('/', async (req, res) => {
   try {
      const templates = await Template.findAll({
         order: [['created_at', 'DESC']],
         where: { status: 'published' }, // 판매중인 템플릿만 조회
      })
      res.json(templates)
   } catch (error) {
      res.status(500).json({ message: error.message })
   }
})

// 템플릿 상세 조회
router.get('/:id', async (req, res) => {
   try {
      const template = await Template.findByPk(req.params.id)

      if (!template) {
         console.log(`❌ 템플릿 ${req.params.id} 없음!`)
         return res.status(404).json({ message: '템플릿을 찾을 수 없습니다.' })
      }

      res.json(template)
   } catch (error) {
      console.error(`🔥 오류 발생: ${error.message}`)
      res.status(500).json({ message: error.message })
   }
})

// 템플릿 수정
router.put('/:id', updateTemplate)
router.delete('/:id', deleteTemplate)

module.exports = router
