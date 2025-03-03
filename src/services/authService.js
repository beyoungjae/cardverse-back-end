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

class AuthService {
   constructor() {}

   async login(email, password) {
      return new Promise((resolve, reject) => {
         passport.authenticate('local', async (authError, user, info) => {
            if (authError) return reject(authError)
            if (!user) return reject({ status: 401, message: info?.message || '이메일 또는 비밀번호가 일치하지 않습니다.' })

            resolve(user.toJSON()) // 로그인 성공 시 유저 데이터 반환
         })({ body: { email, password } })
      })
   }

   async exUser(email, nick) {
      try {
         const existingUser = await User.findOne({
            where: {
               [Op.or]: [{ email }, { nick }],
            },
         })

         // 이메일 또는 닉네임이 존재하면 409 에러 발생
         if (existingUser) {
            throw new Error('이미 사용 중인 이메일 또는 닉네임입니다.')
         }

         return null // 존재하지 않으면 null 반환
      } catch (error) {
         console.error('회원 조회중 오류가 발생하였습니다.', error)
         throw new Error(error.message || '회원 조회 중 오류가 발생하였습니다.')
      }
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
      // const userId = userData.user.id
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

         await User.update(
            { lastLogin: newLastLogin }, // 생성된 loginAt 값을 사용
            { where: { id: userId }, transaction }
         )

         userData.lastLogin = fetchKST(newLastLogin)

         await transaction.commit()
         await loginHistory.reload()
         return userData
      } catch (error) {
         logger.error('로그인 이력 기록중 오류가 발생했습니다.', error.message)
         throw new Error('로그인 이력 기록중 오류가 발생했습니다.')
      }
   }

   async getLoginHistory(userData) {
      const userId = userData.user.id
      try {
         const loginHistory = await LoginHistory.findAll({
            attributes: ['id', 'loginType', 'ipAddress', 'userAgent', 'loginAt', 'userId'], // 필요한 필드만 선택
            where: { userId: userId },
            order: [['loginAt', 'DESC']], // 최신 로그인 기록
            limit: 30, // 최대 30개 이력까지
         })

         return loginHistory
      } catch (error) {
         logger.error('로그인 히스토리 조회 실패:', error.message)
         throw error
      }
   }

   /**
    * 사용자 프로필 업데이트
    * 
    * @param {number} userId - 사용자 ID
    * @param {Object} updateData - 업데이트할 데이터 객체
    * @returns {Object} 업데이트된 사용자 정보
    */
   async updateUserProfile(userId, updateData) {
      try {
         // 닉네임 업데이트 시 중복 확인
         if (updateData.nick) {
            const existingUser = await User.findOne({
               where: {
                  nick: updateData.nick,
                  id: { [Op.ne]: userId } // 자기 자신 제외
               }
            });

            if (existingUser) {
               throw new Error('이미 사용 중인 닉네임입니다.');
            }
         }

         // 사용자 정보 업데이트
         const [updated] = await User.update(updateData, {
            where: { id: userId },
            returning: true
         });

         if (updated === 0) {
            throw new Error('사용자를 찾을 수 없습니다.');
         }

         // 업데이트된 사용자 정보 조회
         const user = await User.findByPk(userId);
         
         if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
         }

         // 안전한 사용자 정보 반환 (비밀번호 제외)
         const safeUser = user.toJSON();
         delete safeUser.password;
         
         return safeUser;
      } catch (error) {
         console.error('프로필 업데이트 중 오류가 발생했습니다.', error);
         throw error;
      }
   }
}

const authServiceInstance = new AuthService()

module.exports = {
   authService: authServiceInstance, // 싱글톤
   AuthService, // 개별 인스턴스 생성 가능
}
