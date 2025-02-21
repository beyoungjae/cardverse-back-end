const Template = require('../models/postModels/template')

exports.createTemplate = async (req, res) => {
   try {
      const { title, type, content } = req.body
      const thumbnail = req.file ? `/uploads/${req.file.filename}` : null

      const template = await Template.create({
         title,
         type,
         content: JSON.parse(content),
         thumbnail,
      })

      res.status(201).json(template)
   } catch (error) {
      res.status(400).json({ message: error.message })
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
