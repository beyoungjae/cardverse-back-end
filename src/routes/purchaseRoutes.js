const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../api/middlewares/isAuth')
const { processPurchase, getPurchaseHistory } = require('../controllers/purchaseController')

// 결제 처리 라우트
router.post('/', isLoggedIn, processPurchase)

// 구매 내역 조회 라우트
router.get('/history', isLoggedIn, getPurchaseHistory)

module.exports = router
