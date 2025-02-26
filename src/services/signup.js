const { User } = require('../models')
const bcrypt = require('bcrypt')
const mailService = require('../jobs/mailService')

const signupService = {
   createUser: async ({ email, password, name }) => {
      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await User.create({
         email,
         password: hashedPassword,
         name,
      })

      await mailService.sendWelcomeMail(email, name)

      return user
   },
}

module.exports = signupService
