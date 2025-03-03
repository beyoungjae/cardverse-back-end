const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../api/middlewares/isAuth')
const { processPurchase, getPurchaseHistory, checkTemplatePurchased } = require('../controllers/purchaseController')

// 결제 처리 라우트
router.post('/', isLoggedIn, processPurchase)

// 구매 내역 조회 라우트
router.get('/history', isLoggedIn, getPurchaseHistory)

// 특정 템플릿 구매 여부 확인 라우트
router.get('/check/:templateId', isLoggedIn, checkTemplatePurchased)

module.exports = router
