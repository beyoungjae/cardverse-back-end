const cron = require('node-cron')
const EmailSequenceJob = require('../jobs/emailSequence')
const ScheduleSequenceJob = require('../jobs/scheduleSequence')

const jobLoader = () => {
   if (typeof EmailSequenceJob.handler === 'function') {
      cron.schedule(EmailSequenceJob.schedule, EmailSequenceJob.handler, {
         scheduled: true,
         timezone: 'Asia/Seoul',
      })
   }

   if (typeof ScheduleSequenceJob.handler === 'function') {
      cron.schedule(ScheduleSequenceJob.schedule, ScheduleSequenceJob.handler, {
         scheduled: true,
         timezone: 'Asia/Seoul',
      })
   }

   ;('✅ All jobs scheduled')
}

module.exports = jobLoader
