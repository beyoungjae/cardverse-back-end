const Image = require('../models/postModels/image')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs').promises

exports.uploadImages = async (req, res) => {
   try {
      if (!req.files || req.files.length === 0) {
         return res.status(400).json({ message: '업로드할 이미지가 없습니다.' })
      }

      const uploadedImages = await Promise.all(
         req.files.map(async (file, index) => {
            const optimizedFileName = `opt-${Date.now()}-${file.originalname}`
            const optimizedPath = path.join('uploads', optimizedFileName)

            await sharp(file.path).resize(1920, null, { withoutEnlargement: true }).jpeg({ quality: 80 }).toFile(optimizedPath)

            await fs.unlink(file.path)

            const image = await Image.create({
               imageUrl: `${process.env.BACKEND_URL}/uploads/${optimizedFileName}`,
               imageOrder: index + 1,
            })

            return {
               id: image.id,
               url: image.imageUrl,
               order: image.imageOrder,
            }
         })
      )

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

      // 파일 시스템에서 이미지 삭제
      const filePath = path.join(__dirname, '..', '..', image.imageUrl)
      await fs.unlink(filePath).catch((err) => console.error('파일 삭제 실패:', err))

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
