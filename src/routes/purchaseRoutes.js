const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../api/middlewares/isAuth')
const { processPurchase } = require('../controllers/purchaseController')

// 결제 처리 라우트
router.post('/', isLoggedIn, processPurchase)

module.exports = router
