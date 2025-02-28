const Payment = require('../models/userModels/payment')
const Template = require('../models/postModels/template')
const User = require('../models/userModels/user')
const Coupon = require('../models/userModels/userCoupon')
const UserTemplate = require('../models/userModels/userTemplate')

exports.processPurchase = async (req, res) => {
   try {
      const { templateId, paymentInfo, totalAmount } = req.body
      const userId = req.user.id // isLoggedIn 미들웨어를 통해 인증된 사용자의 ID

      // 1. 템플릿 존재 확인
      const template = await Template.findByPk(templateId)
      if (!template) {
         return res.status(404).json({
            success: false,
            message: '템플릿을 찾을 수 없습니다.',
         })
      }

      // 2. UserTemplate 생성
      const userTemplate = await UserTemplate.create({
         user_id: userId,
         template_id: templateId,
         isPaid: true,
         status: 'published',
      })

      // 3. 결제 정보 저장
      const payment = await Payment.create({
         user_id: userId,
         user_template_id: userTemplate.id, // UserTemplate의 ID를 참조
         amount: totalAmount,
         method: paymentInfo.method,
         status: 'completed',
      })

      res.status(200).json({
         success: true,
         data: {
            userTemplateId: userTemplate.id,
            paymentId: payment.id,
         },
         message: '결제가 성공적으로 처리되었습니다.',
      })
   } catch (error) {
      console.error('결제 처리 중 오류:', error)
      res.status(500).json({
         success: false,
         message: '결제 처리 중 오류가 발생했습니다.',
         error: error.message,
      })
   }
}

exports.validateCoupon = async (req, res) => {
   try {
      const { couponCode } = req.body
      const coupon = await Coupon.findOne({
         where: {
            code: couponCode,
            isValid: true,
            expiryDate: { [Op.gt]: new Date() },
         },
      })

      if (!coupon) {
         return res.status(404).json({
            success: false,
            message: '유효하지 않은 쿠폰입니다.',
         })
      }

      res.status(200).json({
         success: true,
         coupon: {
            code: coupon.code,
            discountRate: coupon.discountRate,
            name: coupon.name,
         },
      })
   } catch (error) {
      console.error('Coupon validation error:', error)
      res.status(500).json({
         success: false,
         message: '쿠폰 검증 중 오류가 발생했습니다.',
      })
   }
}
