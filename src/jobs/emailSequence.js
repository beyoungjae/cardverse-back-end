const nodemailer = require('nodemailer')
const handlebars = require('handlebars')
const fs = require('fs').promises

const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
   },
})

// 템플릿 캐시
const templateCache = {}

const loadTemplate = async (name) => {
   if (templateCache[name]) return templateCache[name]

   const template = await fs.readFile(`src/jobs/templates/${name}.hbs`, 'utf-8')
   templateCache[name] = handlebars.compile(template)
   return templateCache[name]
}

const EmailSequenceJob = {
   // 회원가입 환영 메일
   sendWelcomeMail: async (email, userName) => {
      try {
         await sendMail({
            to: email,
            subject: '회원가입을 환영합니다!',
            template: 'welcome',
            context: {
               userName,
               loginUrl: `${process.env.FRONTEND_URL}/login`,
            },
         })
      } catch (error) {
         console.error('Welcome mail failed:', error)
         throw error
      }
   },

   // 비밀번호 재설정 인증 메일
   sendVerificationMail: async (email, verificationCode) => {
      try {
         await sendMail({
            to: email,
            subject: '비밀번호 재설정 인증번호',
            template: 'verification',
            context: {
               verificationCode,
               expireTime: '30분', // 인증번호 만료 시간
            },
         })
      } catch (error) {
         console.error('Verification mail failed:', error)
         throw error
      }
   },
}

// 기본 메일 발송 함수
const sendMail = async ({ to, subject, template, context }) => {
   try {
      const compiledTemplate = await loadTemplate(template)
      const html = compiledTemplate(context)

      await transporter.sendMail({
         from: process.env.MAIL_FROM,
         to,
         subject,
         html,
      })
      console.log(`✉️ Mail sent to ${to}`)
   } catch (error) {
      console.error('❌ Mail sending failed:', error)
      throw error
   }
}

module.exports = EmailSequenceJob
