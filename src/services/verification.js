const { User } = require('../models')
const mailService = require('../jobs/mailService')

const verificationService = {
   requestPasswordReset: async (email) => {
      const user = await User.findOne({ where: { email } })
      if (!user) {
         throw new Error('등록되지 않은 이메일입니다.')
      }

      const verificationCode = Math.random().toString().slice(2, 8)

      await mailService.sendVerificationMail(email, verificationCode)

      return verificationCode
   },
}

module.exports = verificationService
