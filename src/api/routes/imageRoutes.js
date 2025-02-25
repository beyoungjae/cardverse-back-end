const express = require('express')
const router = express.Router()
const multer = require('multer')
const imageController = require('../controllers/imageController')

// multer 설정
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, 'uploads/')
   },
   filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`)
   },
})

const upload = multer({
   storage,
   limits: { fileSize: 20 * 1024 * 1024 }, // 20MB 제한
   fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (allowedTypes.includes(file.mimetype)) {
         cb(null, true)
      } else {
         cb(new Error('지원하지 않는 파일 형식입니다.'))
      }
   },
})

// 라우트 설정
router.post('/upload', upload.array('images'), imageController.uploadImages)
router.delete('/:id', imageController.deleteImage)
router.put('/order', imageController.updateImageOrder)

module.exports = router
