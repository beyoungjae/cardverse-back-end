const Template = require('../models/postModels/template')
const multer = require('multer')
const path = require('path')
const { uploadToStorage } = require('../utils/fileUpload')

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, 'uploads/')
   },
   filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
   },
})

const upload = multer({
   storage,
   limits: {
      fileSize: 5 * 1024 * 1024, // 5MB 제한
   },
}).fields([
   { name: 'thumbnail', maxCount: 1 },
   { name: 'detailImages', maxCount: 3 },
])

exports.createTemplate = async (req, res) => {
   try {
      // 필수 필드 검증
      if (!req.files?.thumbnail || !req.body.title || !req.body.price) {
         return res.status(400).json({
            success: false,
            message: '필수 필드가 누락되었습니다. (썸네일, 제목, 가격)',
         })
      }

      // 파일 업로드 처리
      const thumbnailUrl = await uploadToStorage(req.files.thumbnail[0])
      let detailImageUrls = []

      if (req.files.detailImages) {
         detailImageUrls = await Promise.all(req.files.detailImages.map((file) => uploadToStorage(file)))
      }

      // 템플릿 생성
      const template = await Template.create({
         title: req.body.title,
         price: parseFloat(req.body.price),
         category: req.body.category,
         description: req.body.description,
         thumbnailUrl,
         detailImageUrls,
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
      const templates = await Template.findAll({
         order: [['created_at', 'DESC']],
      })
      res.json(templates)
   } catch (error) {
      res.status(500).json({ message: error.message })
   }
}

exports.updateTemplate = async (req, res) => {
   try {
      const { id } = req.params
      const template = await Template.findByPk(id)

      if (!template) {
         return res.status(404).json({ message: '템플릿을 찾을 수 없습니다.' })
      }

      await template.update(req.body)
      res.json(template)
   } catch (error) {
      res.status(400).json({ message: error.message })
   }
}

exports.deleteTemplate = async (req, res) => {
   try {
      const { id } = req.params
      const template = await Template.findByPk(id)

      if (!template) {
         return res.status(404).json({ message: '템플릿을 찾을 수 없습니다.' })
      }

      // 실제 삭제가 아닌 상태 변경
      await template.update({ status: 'deleted' })

      res.json({ message: '템플릿이 삭제되었습니다.' })
   } catch (error) {
      res.status(500).json({ message: error.message })
   }
}
