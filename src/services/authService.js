const jwt = require('jsonwebtoken')
const logger = require('../config/logger')
const User = require('../models/userModels/user')
const OauthAccount = require('../models/userModels/oauthAccount')
const LoginHistory = require('../models/userModels/loginHistory')
const { sequelize } = require('../models')

class AuthService {
   constructor() {}

   // it_token을 디코딩 => provider_user_id 추출
   async getProviderUserIdFromIdToken(id_token) {
      console.log(id_token)

      if (!id_token) throw new Error('id_token이 없습니다.')

      const decoded = jwt.decode(id_token)
      if (!decoded || !decoded.sub) throw new Error('id_token에 sub 값이 없습니다.')

      logger.info(decoded)

      return decoded.sub
   }

   async createUser(virtualEmail, provider, providerUserId, tokenData) {
      const transaction = await sequelize.transaction()

      try {
         const tempNick = `${provider}_${providerUserId}`

         // ✅ 새 유저 생성
         const user = await User.create(
            {
               email: virtualEmail,
               nick: tempNick,
               role: 'user',
               status: 'active',
            },
            { transaction }
         )

         const finalNick = `회원${user.id}`

         await user.update({ nick: finalNick }, { transaction })

         const oauthAccount = await OauthAccount.create(
            {
               provider,
               providerUserId,
               user_id: user.id, // ✅ 새로 생성된 유저의 ID 설정
               accessToken: tokenData.accessToken, // ✅ 토큰 정보 추가
               refreshToken: tokenData.refreshToken,
               tokenExpiresAt: tokenData.tokenExpiresAt,
            },
            { transaction }
         )

         await transaction.commit()
         return user
      } catch (error) {
         await transaction.rollback() // ❌ 실패하면 롤백
         logger.error('회원 가입 트랜잭션 오류:', error)
      }
   }

   async updateUser(userId, tokenData) {
      try {
         await OauthAccount.update(
            {
               accessToken: tokenData.accessToken,
               refreshToken: tokenData.refreshToken,
               tokenExpiresAt: tokenData.tokenExpiresAt,
            },
            {
               where: { user_id: userId },
            }
         )

         // ✅ 업데이트된 OAuth 계정 정보 다시 조회
         const oauthAccount = await OauthAccount.findOne({
            where: { user_id: userId },
            include: [{ model: User, foreignKey: 'user_id' }],
         })

         return { oauthAccount, user: oauthAccount.User, created: false } // ✅ 기존 유저 정보 반환
      } catch (error) {
         logger.error('OAuth 계정 업데이트 오류:', error)
         throw error
      }
   }

   // 소셜로그인시 계정 확인 및 생성
   async findOrCreateUser(tokenData, virtualEmail, provider, providerUserId) {
      // logger.info(tokenData)
      // logger.info(virtualEmail)

      if (!tokenData) {
         logger.error('tokenData가 없습니다')
         throw new Error('tokenData가 없습니다.')
      }

      const [oauthAccount, created] = await OauthAccount.findOrCreate({
         where: {
            provider: tokenData.provider,
            providerUserId: tokenData.providerUserId,
         },
         include: [
            {
               model: User,
               foreignKey: 'user_id',
            },
         ],
         defaults: {
            // 새로 생성될 때만 적용되는 값들
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            tokenExpiresAt: tokenData.tokenExpiresAt,
         },
      })

      logger.debug(oauthAccount)
      logger.debug(created)

      // 새 계정일 경우
      if (created) {
         const transaction = await sequelize.transaction() // ✅ 트랜잭션 시작

         try {
            const tempNick = `${provider}_${providerUserId}`

            // User 생성
            const user = await User.create(
               {
                  email: virtualEmail,
                  nick: tempNick,
                  role: 'user',
                  status: 'active',
               },
               { transaction } // ✅ 트랜잭션 적용
            )

            // 2️⃣ 최종 닉네임 업데이트 → `회원{userId}`
            const finalNick = `회원${user.id}`
            await user.update({ nick: finalNick }, { transaction })

            // user_id 업데이트 (oauthAccount)
            await oauthAccount.update(
               {
                  user_id: user.id,
               },
               { transaction } // ✅ 트랜잭션 적용
            )

            await transaction.commit() // ✅ 성공하면 커밋
         } catch (error) {
            await transaction.rollback() // ❌ 실패하면 롤백
            console.error('회원 가입 트랜잭션 오류:', error)
         }
      } else {
         // 기존 계정이면 토큰 정보만 업데이트
         await oauthAccount.update({
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            tokenExpiresAt: tokenData.tokenExpiresAt,
         })
      }

      const fullOauthAccount = await OauthAccount.findOne({
         where: {
            provider: tokenData.provider,
            providerUserId: tokenData.providerUserId,
         },
         include: [
            {
               model: User,
               foreignKey: 'user_id',
            },
         ],
      })

      return {
         oauthAccount: fullOauthAccount,
         created,
      }
   }

   // 소셜 로그인시 가상 이메일 생성
   async generateVirtualEmail(provider, providerUserId) {
      const virtualEmail = `${provider}${providerUserId}@temp.com`

      const exUser = await User.findOne({ where: { virtualEmail } })

      if (exUser) {
         return { virtualEmail, exists: true, user: exUser }
      }

      return { virtualEmail, exists: false }
   }

   // 로그인 히스토리 기록
   async recordLoginHistory(userId, loginType, req) {
      try {
         const loginData = cleanLoginData(req, loginType) // ✅ 공통 데이터 정리

         // 1️⃣ [LoginHistory]테이블에 로그인 기록 추가
         const loginHistory = await LoginHistory.create({
            userId,
            loginType,
            ipAddress: loginData.ipAddress,
            userAgent: loginData.userAgent,
         })

         // 2️⃣ 가장 최근 로그인 시간 유저에 업데이트
         await User.update({ lastLogin: loginHistory.loginAt }, { where: { id: userId } })

         logger.info(`✅ 로그인 기록 저장 완료: userId=${userId}, lastLogin=${latestLogin?.loginAt}`)

         return loginHistory
      } catch (error) {
         logger.error('로그인 히스토리 저장 오류:', error)
         throw error
      }
   }

   // async recordLoginHistory({ loginData, userId }) {
   //    logger.info('로그인 히스토리 기록 시작:', { userId, loginData })

   //    try {
   //       // 1️⃣ [LoginHistory]테이블에 로그인 기록 추가
   //       const loginHistory = await LoginHistory.create({
   //          userId: userId,
   //          loginType: loginData.loginType,
   //          ipAddress: loginData.ipAddress,
   //          userAgent: loginData.userAgent,
   //       })

   //       // 2️⃣ 가장 최근 로그인 시간 유저에 업데이트
   //       await User.update({ lastLogin: loginHistory.loginAt }, { where: { id: userId } })

   //       return loginHistory
   //    } catch (error) {
   //       logger.error('로그인 히스토리 기록 실패:', error)
   //       throw error
   //    }
   // }

   // 로그인 히스토리 읽기
   async getLoginHistory(userId) {
      try {
         const loginHistory = await LoginHistory.findAll({
            where: { userId },
            order: [['loginAt', 'DESC']], // 최신 로그인 기록
         })

         // logger.debug('loginHistory:', loginHistory)
         return loginHistory
      } catch (error) {
         logger.error('로그인 히스토리 조회 실패:', error)
         throw error
      }
   }

   // 포맷 oauth 리스폰데이터
   async formatOAuthResponse({ oauthData, loginHistory }) {
      try {
         const { oauthAccount, created } = oauthData

         const isDefaultNick = oauthAccount.User.nick === `회원${oauthAccount.User.id}`
         const nickMessage = isDefaultNick ? '닉네임을 새로 설정해주세요' : null

         return {
            success: true,
            message: created ? '새로운 계정이 생성되었습니다.' : '로그인 성공',
            user: {
               id: oauthAccount.User.id,
               email: oauthAccount.User.email,
               nick: oauthAccount.User.nick,
               role: oauthAccount.User.role,
               accessToken: oauthAccount.accessToken, // 여기에 accessToken 포함
               isNewUser: created,
               loginHistory,
               nickMessage: nickMessage || null,
            },
         }
      } catch (error) {
         logger.error('OAuth 응답 데이터 포맷 실패:', error)
         throw new Error('로그인 응답 처리 중 오류가 발생했습니다.')
      }
   }
}

module.exports = new AuthService()
