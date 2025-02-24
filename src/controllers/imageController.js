const Image = require('../models/postModels/image')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs').promises

exports.uploadImages = async (req, res) => {
   try {
      if (!req.files || req.files.length === 0) {
         return res.status(400).json({ message: '업로드할 이미지가 없습니다.' })
      }

      const uploadPromises = req.files.map(async (file, index) => {
         const optimizedFileName = `opt-${Date.now()}-${file.originalname}`
         const optimizedPath = path.join('uploads', optimizedFileName)

         await sharp(file.path)
            .resize(1920, null, {
               withoutEnlargement: true,
               fastShrinkOnLoad: true,
            })
            .jpeg({
               quality: 80,
               mozjpeg: true,
               force: false,
            })
            .toFile(optimizedPath)

         await fs.unlink(file.path).catch((err) => console.error('원본 파일 삭제 실패:', err))

         const imageUrl = `${process.env.BACKEND_URL}/uploads/${optimizedFileName}`

         return Image.create({
            imageUrl,
            imageOrder: index + 1,
         })
      })

      const uploadedImages = await Promise.all(uploadPromises)
      res.status(201).json(uploadedImages)
   } catch (error) {
      console.error('이미지 업로드 에러:', error)
      res.status(500).json({ message: '이미지 업로드 중 오류가 발생했습니다.' })
   }
}

exports.deleteImage = async (req, res) => {
   try {
      const { id } = req.params
      const image = await Image.findByPk(id)

      if (!image) {
         return res.status(404).json({ message: '이미지를 찾을 수 없습니다.' })
      }

      // URL에서 파일명만 추출
      const fileName = image.imageUrl.split('/').pop()

      // 실제 파일 시스템 경로 구성
      const filePath = path.join(__dirname, '../../uploads', fileName)

      // 파일 삭제
      await fs.unlink(filePath).catch((err) => {
         console.error('파일 삭제 실패:', err)
         // 파일이 없어도 DB에서는 삭제 진행
      })

      // DB에서 이미지 정보 삭제
      await image.destroy()

      res.json({ message: '이미지가 삭제되었습니다.' })
   } catch (error) {
      console.error('이미지 삭제 에러:', error)
      res.status(500).json({ message: '이미지 삭제 중 오류가 발생했습니다.' })
   }
}

exports.updateImageOrder = async (req, res) => {
   try {
      const { images } = req.body

      await Promise.all(images.map((img) => Image.update({ imageOrder: img.order }, { where: { id: img.id } })))

      res.json({ message: '이미지 순서가 업데이트되었습니다.' })
   } catch (error) {
      console.error('이미지 순서 업데이트 에러:', error)
      res.status(500).json({ message: '이미지 순서 업데이트 중 오류가 발생했습니다.' })
   }
}
