const EventEmitter = require('events')
const eventEmitter = new EventEmitter()

eventEmitter.on('userSignup', (userId) => {
    console.log(`🎉 유저 ${userId} 회원가입 완료! 환영 쿠폰 지급`)
})