const { check, validationResult } = require('express-validator')

exports.validSignup = [
   check('email').isEmail().withMessage('올바른 이메일 형식을 입력하세요.'),
   check('password')
      .isLength({ min: 8 })
      .withMessage('비밀번호는 최소 8자 이상이어야 합니다.')
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .withMessage('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.'),
   check('nick').notEmpty().withMessage('닉네임을 입력해야 합니다.'),
   (req, res, next) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
         return res.status(400).json({ success: false, errors: errors.array() })
      }
   check('signupType').notEmpty().withMessage('추천인이 비어있습니다.')
      next()
   },
]

exports.validLogin = [
   check('email').isEmail().withMessage('올바른 이메일 형식을 입력하세요.'),
   check('password')
      .isLength({ min: 8 })
      .withMessage('비밀번호는 최소 8자 이상이어야 합니다.')
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .withMessage('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.'),
]
