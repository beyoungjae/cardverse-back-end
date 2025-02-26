const Payment = require('../models/userModels/payment')
const Template = require('../models/postModels/template')
const User = require('../models/userModels/user')
const Coupon = require('../models/userModels/userCoupon')

exports.processPurchase = async (req, res) => {
   try {
      const { userId, templateId, paymentInfo, couponCode, totalAmount } = req.body

      // 1. 사용자 확인
      const user = await User.findByPk(userId)
      if (!user) {
         return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' })
      }

      // 2. 템플릿 확인
      const template = await Template.findByPk(templateId)
      if (!template) {
         return res.status(404).json({ success: false, message: '템플릿을 찾을 수 없습니다.' })
      }

      // 3. 쿠폰 적용 (있는 경우)
      let finalAmount = totalAmount
      if (couponCode) {
         const coupon = await Coupon.findOne({ where: { code: couponCode, isValid: true } })
         if (coupon) {
            finalAmount = totalAmount - totalAmount * coupon.discountRate
            await coupon.update({ isValid: false }) // 쿠폰 사용 처리
         }
      }

      // 4. 결제 정보 저장
      const payment = await Payment.create({
         userId,
         templateId,
         amount: finalAmount,
         paymentMethod: paymentInfo.method,
         status: 'completed',
         purchaseDate: new Date(),
      })

      // 5. 사용자-템플릿 연결 (구매 후 템플릿 접근 권한 부여)
      await user.addTemplate(template)

      res.status(200).json({
         success: true,
         paymentId: payment.id,
         message: '결제가 성공적으로 처리되었습니다.',
      })
   } catch (error) {
      console.error('Payment processing error:', error)
      res.status(500).json({
         success: false,
         message: '결제 처리 중 오류가 발생했습니다.',
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
