exports.UTCtoKST = (expiresIn) => {
   const nowUTC = new Date()
   const nowKST = new Date(nowUTC.getTime() + 9 * 60 * 60 * 1000)
   const expirationTime = new Date(nowKST.getTime() + expiresIn * 1000)
   return expirationTime
}

exports.getCurrentKST = () => {
   const nowUTC = new Date()
   const nowKST = new Date(nowUTC.getTime() + 9 * 60 * 60 * 1000)
   return nowKST
}

exports.formatDate = (seconds = 0) => {
   const now = new Date()
   now.setSeconds(now.getSeconds() + seconds)

   return now
}

exports.fetchKST = (date) => {
   const kstDate = new Date(date)
   kstDate.setHours(kstDate.getHours() + 9)
   return kstDate.toISOString().slice(0, 19).replace('T', ' ')
}
