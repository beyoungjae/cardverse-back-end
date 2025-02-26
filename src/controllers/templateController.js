const Template = require('../models/postModels/template')
const multer = require('multer')
const path = require('path')
const imageController = require('./imageController')

// 파일 업로드를 위한 multer 설정
const storage = multer.memoryStorage() // 메모리 스토리지 사용

const upload = multer({
   storage,
   limits: {
      fileSize: 20 * 1024 * 1024, // 20MB 제한
   },
   fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (allowedTypes.includes(file.mimetype)) {
         cb(null, true)
      } else {
         cb(new Error('지원되지 않는 파일 형식입니다.'), false)
      }
   },
}).fields([
   { name: 'thumbnail', maxCount: 1 },
   { name: 'detailImages', maxCount: 3 },
])

exports.createTemplate = async (req, res) => {
   try {
      // 필수 필드 검증
      if (!req.files?.thumbnail || !req.body.title || !req.body.price || !req.body.category || !req.body.data) {
         return res.status(400).json({
            success: false,
            message: '필수 필드가 누락되었습니다. (썸네일, 제목, 가격, 카테고리, 데이터)',
         })
      }

      // 이미지 업로드 처리 (imageController 활용)
      const thumbnailUrl = await imageController.uploadImage(req.files.thumbnail[0])
      let detailImageUrls = []

      if (req.files.detailImages) {
         detailImageUrls = await Promise.all(req.files.detailImages.map((file) => imageController.uploadImage(file)))
      }

      // 템플릿 데이터 파싱
      const templateData = JSON.parse(req.body.data)

      // 템플릿 생성
      const template = await Template.create({
         title: req.body.title,
         price: parseFloat(req.body.price),
         category: req.body.category,
         thumbnail: thumbnailUrl,
         detailImageUrls,
         data: templateData,
         status: 'published', // draft = 작성중, published = 판매중, ended = 판매종료, deleted = 삭제됨
      })

      res.status(201).json({
         success: true,
         template,
      })
   } catch (error) {
      console.error('Template creation error:', error)
      res.status(500).json({
         success: false,
         message: '템플릿 생성 중 오류가 발생했습니다.',
         error: error.message,
      })
   }
}

exports.getTemplates = async (req, res) => {
   try {
      const { category, status = 'active' } = req.query
      const where = { status }

      if (category) {
         where.category = category
      }

      const templates = await Template.findAll({
         where,
         order: [['createdAt', 'DESC']],
      })

      res.json({
         success: true,
         templates,
      })
   } catch (error) {
      res.status(500).json({
         success: false,
         message: '템플릿 목록 조회 중 오류가 발생했습니다.',
         error: error.message,
      })
   }
}

exports.updateTemplate = async (req, res) => {
   try {
      const { id } = req.params
      const template = await Template.findByPk(id)

      if (!template) {
         return res.status(404).json({
            success: false,
            message: '템플릿을 찾을 수 없습니다.',
         })
      }

      // 이미지 업데이트가 있는 경우
      if (req.files?.thumbnail) {
         template.thumbnailUrl = await imageController.uploadImage(req.files.thumbnail[0])
      }

      if (req.files?.detailImages) {
         template.detailImageUrls = await Promise.all(req.files.detailImages.map((file) => imageController.uploadImage(file)))
      }

      // 기타 필드 업데이트
      const updateData = { ...req.body }
      if (updateData.data) {
         updateData.data = JSON.parse(updateData.data)
      }

      await template.update(updateData)

      res.json({
         success: true,
         template,
      })
   } catch (error) {
      res.status(500).json({
         success: false,
         message: '템플릿 수정 중 오류가 발생했습니다.',
         error: error.message,
      })
   }
}

exports.deleteTemplate = async (req, res) => {
   try {
      const { id } = req.params
      const template = await Template.findByPk(id)

      if (!template) {
         return res.status(404).json({
            success: false,
            message: '템플릿을 찾을 수 없습니다.',
         })
      }

      // 실제 삭제가 아닌 상태 변경
      await template.update({ status: 'deleted' })

      res.json({
         success: true,
         message: '템플릿이 삭제되었습니다.',
      })
   } catch (error) {
      res.status(500).json({
         success: false,
         message: '템플릿 삭제 중 오류가 발생했습니다.',
         error: error.message,
      })
   }
}

exports.upload = upload
