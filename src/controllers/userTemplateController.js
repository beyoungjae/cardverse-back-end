const Template = require('../models/postModels/template')
const UserTemplate = require('../models/userModels/userTemplate')
const TemplateSet = require('../models/templateModels/templateSet')

exports.createUserTemplate = async (req, res) => {
   try {
      const userId = req.session.id
      const { templateId, formData } = req.body

      // 기본 템플릿 존재 확인
      const template = await Template.findByPk(templateId)
      if (!template) {
         return res.status(404).json({
            success: false,
            message: '템플릿을 찾을 수 없습니다.',
         })
      }

      // 사용자 템플릿 생성
      const userTemplate = await UserTemplate.create({
         userId,
         templateId,
         status: 'draft',
         isPaid: false,
         expriesAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
      })

      // formData를 문자열로 변환 (객체인 경우)
      const formDataString = typeof formData === 'string' ? formData : JSON.stringify(formData)

      // TemplateSet 생성 및 formData 저장
      const templateSet = await TemplateSet.create({
         user_template_id: userTemplate.id,
         formData: formDataString,
      })

      res.status(201).json({
         success: true,
         userTemplateId: userTemplate.id,
         message: '사용자 템플릿이 저장되었습니다.',
      })
   } catch (error) {
      console.error('User template creation error:', error)
      res.status(500).json({
         success: false,
         message: '사용자 템플릿 저장 중 오류가 발생했습니다.',
         error: error.message,
      })
   }
}

// TemplateSet 업데이트
exports.updateTemplateSet = async (req, res) => {
   try {
      const { id } = req.params // userTemplateId
      const { formData } = req.body

      // UserTemplate 존재 확인
      const userTemplate = await UserTemplate.findByPk(id)
      if (!userTemplate) {
         return res.status(404).json({
            success: false,
            message: '사용자 템플릿을 찾을 수 없습니다.',
         })
      }

      // formData를 문자열로 변환 (객체인 경우)
      const formDataString = typeof formData === 'string' ? formData : JSON.stringify(formData)

      // TemplateSet 찾기 또는 생성
      let templateSet = await TemplateSet.findOne({
         where: { user_template_id: id },
      })

      if (templateSet) {
         // 기존 데이터 업데이트
         await templateSet.update({ formData: formDataString })
      } else {
         // 새 데이터 생성
         templateSet = await TemplateSet.create({
            user_template_id: id,
            formData: formDataString,
         })
      }

      res.json({
         success: true,
         message: '템플릿 데이터가 업데이트되었습니다.',
      })
   } catch (error) {
      console.error('Template set update error:', error)
      res.status(500).json({
         success: false,
         message: '템플릿 데이터 업데이트 중 오류가 발생했습니다.',
         error: error.message,
      })
   }
}

// 사용자 템플릿 조회
exports.getUserTemplate = async (req, res) => {
   try {
      const { id } = req.params
      const userTemplate = await UserTemplate.findByPk(id, {
         include: [{ model: Template }, { model: TemplateSet }],
      })

      if (!userTemplate) {
         return res.status(404).json({
            success: false,
            message: '템플릿을 찾을 수 없습니다.',
         })
      }

      // TemplateSet이 없는 경우 빈 객체 반환
      const formData = userTemplate.TemplateSet?.formData ? JSON.parse(userTemplate.TemplateSet.formData) : {}

      res.json({
         success: true,
         userTemplate: {
            id: userTemplate.id,
            template: userTemplate.Template,
            formData,
         },
      })
   } catch (error) {
      console.error('사용자 템플릿 조회 오류:', error)
      res.status(500).json({
         success: false,
         message: '사용자 템플릿 조회 중 오류가 발생했습니다.',
         error: error.message,
      })
   }
}
