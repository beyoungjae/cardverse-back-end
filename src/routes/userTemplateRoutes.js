const express = require('express')
const router = express.Router()
const { createUserTemplate, getUserTemplate, updateTemplateSet } = require('../controllers/userTemplateController')
const { isLoggedIn } = require('../api/middlewares/isAuth')

// 사용자 템플릿 생성
router.post('/', isLoggedIn, createUserTemplate)

// 사용자 템플릿 조회
router.get('/:id', getUserTemplate)

// 템플릿 세트 업데이트 (formData 저장)
router.put('/:id/template-set', isLoggedIn, updateTemplateSet)

module.exports = router
