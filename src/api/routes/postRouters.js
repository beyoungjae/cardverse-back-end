const express = require('express')
const router = express.Router()
const postController = require('../../controllers/postController')
const { isLoggedIn } = require('../middlewares/isAuth')
const { validPost } = require('../middlewares/validators')

router.get('/', postController.getPosts)
router.post('/create', isLoggedIn, validPost, postController.createPost)

module.exports = router
