const { Template, Event, User, Stats } = require('../models')
const { Op } = require('sequelize')

const ScheduleSequenceJob = {
   schedule: '0 1 * * *', // 매일 새벽 1시

   handler: async () => {
      try {
         // 일일 통계 수집 로직
         const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
         // ... 통계 수집 로직
      } catch (error) {
         console.error('❌ Scheduler failed:', error)
      }
   },
}

module.exports = ScheduleSequenceJob