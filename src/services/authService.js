const jwt = require('jsonwebtoken')
const logger = require('../config/logger')
const User = require('../models/userModels/user')
const OauthAccount = require('../models/userModels/oauthAccount')
const LoginHistory = require('../models/userModels/loginHistory')
const { cleanLoginData } = require('../utils/requestUtils')
const { sequelize } = require('../models')
const passport = require('passport')
const { formatDate, fetchKST } = require('../utils/timezoneUtil')
const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const { transformAuthResponse } = require('../utils/responseHelper')

class AuthService {
   constructor() {}

   async login(req, res, next) {
      return new Promise((resolve, reject) => {
         passport.authenticate('local', (authError, user, info) => {
            if (authError) {
               reject({ status: 500, message: '인증 중 오류 발생', error: authError })
            } else if (!user) {
               reject({ status: 401, message: info.message || '로그인 실패' })
            } else {
               req.login(user, (loginError) => {
                  if (loginError) {
                     reject({ status: 500, message: '로그인 중 오류 발생', error: loginError })
                  } else {
                     resolve({
                        id: user.id,
                        email: user.email,
                        nick: user.nick,
                        role: user.role,
                        provider: 'local',
                     })
                  }
               })
            }
         })(req, res, next)
      })
   }

   async exUser(email, nick) {
      try {
         const existingUser = await User.findOne({
            where: {
               [Op.or]: [{ email }, { nick }],
            },
         })

         // ✅ 이메일 또는 닉네임이 존재하면 409 에러 발생
         if (existingUser) {
            throw new Error('이미 사용 중인 이메일 또는 닉네임입니다.')
         }

         return null // 존재하지 않으면 null 반환
      } catch (error) {
         console.error('회원 조회중 오류가 발생하였습니다.', error)
         throw new Error(error.message || '회원 조회 중 오류가 발생하였습니다.')
      }
   }
   async validUser(id, provider, refreshToken) {
      try {
         logger.info('⏩ validUser 체크 실행:', `id:${id}, provider:${provider}, refreshToken:${refreshToken}`)

         // ID를 기준으로 User 테이블 조회
         const user = await User.findByPk(id, {
            include: [
               {
                  model: OauthAccount,
                  as: 'oauthAccount',
                  where: provider ? { provider } : undefined,
                  required: false,
               },
            ],
         })

         if (!user) {
            console.warn(`⚠️ 유저 데이터 없음 (id=${id}, provider=${provider})`)
            return false
         }

         // OauthAccount 테이블에서 provider & refreshToken 검증
         const oauthAccount = user.oauthAccount
         if (!oauthAccount || oauthAccount.refreshToken !== refreshToken) {
            console.warn(`⚠️ 리프레시 토큰 불일치 (유저 ID: ${id}, provider: ${provider})`)
            return false
         }

         return true
      } catch (error) {}
   }

   async createUser(data) {
      try {
         const { email, password, nick, signupType, referralEmail } = data
         const hash = await bcrypt.hash(password, 12)

         const newUser = await User.create({
            email,
            password: hash,
            nick,
         })

         if (signupType === 'referral') {
            if (!referralEmail) {
               throw new Error('추천인 이메일이 필요합니다.')
            }

            const referralUser = await User.findOne({ where: { email: referralEmail } })

            if (!referralUser) {
               throw new Error('존재하지 않는 추천인입니다.')
            }

            // TODO: 추천인 관련 쿠폰 발급 등 추가 로직 구현 예정
         }

         const safeUser = newUser.toJSON()
         delete safeUser.password

         const responseData = {
            success: 'true',
            message: '회원가입에 성공했습니다.',
            user: safeUser,
         }

         return responseData
      } catch (error) {
         console.error('회원가입 중 오류가 발생했습니다.', error)
         throw new Error(error.message || '회원 조회 중 오류가 발생하였습니다.')
      }
   }
   async recordLoginHistory(req, provider, userData) {
      const transaction = await sequelize.transaction()
      const userId = userData?.id || userData?.user?.id
      const loginData = cleanLoginData(req, provider)
      const newLastLogin = new Date()

      try {
         const loginHistory = await LoginHistory.create(
            {
               userId: userId,
               loginType: provider,
               ipAddress: loginData.ipAddress,
               userAgent: loginData.userAgent,
            },
            { transaction }
         )

         await User.update({ lastLogin: newLastLogin }, { where: { id: userId }, transaction })

         userData.lastLogin = fetchKST(newLastLogin)

         await transaction.commit()
         await loginHistory.reload()
         return userData
      } catch (error) {
         console.error('로그인 이력 기록중 오류가 발생했습니다.', error.message)
         throw new Error('로그인 이력 기록중 오류가 발생했습니다.')
      }
   }

   async getLoginHistory(userData) {
      const userId = userData.user.id
      try {
         const loginHistory = await LoginHistory.findAll({
            attributes: ['id', 'loginType', 'ipAddress', 'userAgent', 'loginAt', 'userId'],
            where: { userId: userId },
            order: [['loginAt', 'DESC']],
            limit: 30,
         })

         return loginHistory
      } catch (error) {
         console.error('로그인 히스토리 조회 실패:', error.message)
         throw error
      }
   }

   validNick(nick) {
      if (!nick || nick.trim() === '') {
         return { success: false, message: '닉네임은 필수 항목입니다.' }
      }

      // 닉네임 길이 체크
      if (nick.length < 2 || nick.length > 20) {
         return { success: false, message: '닉네임은 2자 이상 20자 이하여야 합니다.' }
      }

      return { success: true, message: '닉네임 데이터 검증 완료' }
   }

   async updateUserProfile(userId, userData, updateData) {
      try {
         // 닉네임 업데이트 시 중복 확인
         if (updateData.nick) {
            const existingUser = await User.findOne({
               where: {
                  nick: updateData.nick,
                  id: { [Op.ne]: userId }, // 자기 자신 제외
               },
            })

            if (existingUser) {
               throw new Error('이미 사용 중인 닉네임입니다.')
            }
         }

         // 사용자 정보 업데이트
         const [updated] = await User.update(updateData, {
            where: { id: userId },
            returning: true,
         })

         if (updated === 0) {
            throw new Error('사용자를 찾을 수 없습니다.')
         }

         // 업데이트된 사용자 정보 조회
         const user = await User.findByPk(userId)

         if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.')
         }

         const safeUser = user.toJSON()
         const responseData = transformAuthResponse({ success: true, user: safeUser, token: userData, provider: userData.provider, message: '닉네임 변경이 완료되었습니다.' })

         return responseData
      } catch (error) {
         console.error(
            JSON.stringify(
               {
                  path: 'service',
                  type: 'function',
                  name: 'updateUserProfile(userId, updateData)',
                  message: '프로필 업데이트 중 오류가 발생했습니다.',
                  error: error.stack, // 에러 스택 포함
               },
               null,
               4
            )
         )
         throw error
      }
   }
}

const authServiceInstance = new AuthService()

module.exports = {
   authService: authServiceInstance,
   AuthService,
}
