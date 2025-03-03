const { Payment, UserTemplate, Template } = require('../models')
const Coupon = require('../models/userModels/userCoupon')

exports.processPurchase = async (req, res) => {
   try {
      const { templateId, paymentInfo, totalAmount } = req.body
      const userId = req.user.id

      // UserTemplate 생성
      const userTemplate = await UserTemplate.create({
         user_id: userId,
         template_id: templateId,
         isPaid: true,
         status: 'published',
      })

      // Payment 생성
      const payment = await Payment.create({
         user_id: userId,
         user_template_id: userTemplate.id,
         amount: totalAmount,
         method: paymentInfo.method,
         status: 'completed',
      })

      return res.status(200).json({
         success: true,
         data: {
            payment,
            userTemplate,
         },
      })
   } catch (error) {
      console.error('결제 처리 오류:', error)
      return res.status(500).json({
         success: false,
         message: '결제 처리 중 오류가 발생했습니다.',
      })
   }
}

exports.getPurchaseHistory = async (req, res) => {
   try {
      const userId = req.user.id

      // 사용자의 결제 내역 조회
      const purchases = await Payment.findAll({
         where: { user_id: userId },
         include: [
            {
               model: UserTemplate,
               include: [
                  {
                     model: Template,
                     attributes: ['id', 'title', 'thumbnail', 'category'],
                  },
               ],
            },
         ],
         order: [['createdAt', 'DESC']],
      })

      // 응답 데이터 가공
      const formattedPurchases = purchases.map((purchase) => ({
         id: purchase.id,
         amount: purchase.amount,
         method: purchase.method,
         status: purchase.status,
         createdAt: purchase.createdAt,
         userTemplateId: purchase.UserTemplate?.id,
         template: purchase.UserTemplate?.Template,
      }))

      return res.status(200).json(formattedPurchases)
   } catch (error) {
      console.error('구매 내역 조회 오류:', error)
      return res.status(500).json({
         success: false,
         message: '구매 내역 조회 중 오류가 발생했습니다.',
      })
   }
}

// 특정 템플릿 구매 여부 확인
exports.checkTemplatePurchased = async (req, res) => {
   try {
      const userId = req.user.id
      const templateId = req.params.templateId

      // 사용자가 해당 템플릿을 구매했는지 확인
      const userTemplate = await UserTemplate.findOne({
         where: {
            user_id: userId,
            template_id: templateId,
            isPaid: true,
         },
      })

      return res.status(200).json({
         purchased: !!userTemplate,
      })
   } catch (error) {
      console.error('템플릿 구매 여부 확인 오류:', error)
      return res.status(500).json({
         success: false,
         message: '템플릿 구매 여부 확인 중 오류가 발생했습니다.',
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
