// // src/jobs/index.js
// const cleanupJob = require('./cleanupJob')
// const notificationJob = require('./notificationJob')
// const analyticsJob = require('./analyticsJob')

// const jobs = {
//    cleanup: cleanupJob,
//    notification: notificationJob,
//    analytics: analyticsJob,
// }

// module.exports = jobs

// // src/jobs/cleanupJob.js
// const cron = require('node-cron')
// const { Template, Event } = require('../models')

// const cleanupJob = {
//    // 매일 자정에 실행
//    schedule: '0 0 * * *',

//    handler: async () => {
//       try {
//          // 만료된 템플릿 처리
//          await Template.update(
//             { status: 'inactive' },
//             {
//                where: {
//                   endDate: {
//                      [Op.lt]: new Date(),
//                   },
//                },
//             },
//          )

//          // 만료된 이벤트 처리
//          await Event.update(
//             { status: 'ended' },
//             {
//                where: {
//                   endDate: {
//                      [Op.lt]: new Date(),
//                   },
//                },
//             },
//          )

//          console.log('✅ Cleanup job completed')
//       } catch (error) {
//          console.error('❌ Cleanup job failed:', error)
//       }
//    },
// }

// // src/jobs/notificationJob.js
// const notificationJob = {
//    // 매시간 실행
//    schedule: '0 * * * *',

//    handler: async () => {
//       try {
//          // 알림 발송 로직
//          console.log('✅ Notification job completed')
//       } catch (error) {
//          console.error('❌ Notification job failed:', error)
//       }
//    },
// }

// // src/jobs/analyticsJob.js
// const analyticsJob = {
//    // 매일 새벽 3시 실행
//    schedule: '0 3 * * *',

//    handler: async () => {
//       try {
//          // 통계 데이터 집계 로직
//          console.log('✅ Analytics job completed')
//       } catch (error) {
//          console.error('❌ Analytics job failed:', error)
//       }
//    },
// }

// src/loaders/jobLoader.js
const cron = require('node-cron')
const { EmailSequenceJob, ScheduleSequenceJob } = require('../jobs')

const jobLoader = () => {
   // 메일 서비스 작업 정의
   cron.schedule(EmailSequenceJob.schedule, EmailSequenceJob.handler, {
      scheduled: true,
      timezone: 'Asia/Seoul',
   })

   // 스케줄러 작업 정의
   cron.schedule(ScheduleSequenceJob.schedule, ScheduleSequenceJob.handler, {
      scheduled: true,
      timezone: 'Asia/Seoul',
   })

   console.log('✅ All jobs scheduled')
}

module.exports = jobLoader
