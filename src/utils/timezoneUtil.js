exports.UTCtoKST = (expiresIn) => {
   const nowUTC = new Date() // 현재 UTC 시간
   const nowKST = new Date(nowUTC.getTime() + 9 * 60 * 60 * 1000) // KST로 변환 (UTC + 9시간)
   const expirationTime = new Date(nowKST.getTime() + expiresIn * 1000) // 만료 시간 계산
   return expirationTime
}

exports.getCurrentKST = () => {
   const nowUTC = new Date() // 현재 UTC 시간
   const nowKST = new Date(nowUTC.getTime() + 9 * 60 * 60 * 1000) // KST로 변환 (UTC + 9시간)
   return nowKST
}

exports.formatDate = (seconds = 0) => {
   const now = new Date() // 현재 날짜와 시간
   now.setSeconds(now.getSeconds() + seconds) // 주어진 초를 더함

   return now // 형식화된 Date 객체 반환
}

exports.fetchKST = (date) => {
   const kstDate = new Date(date)
   kstDate.setHours(kstDate.getHours() + 9)
   return kstDate.toISOString().slice(0, 19).replace('T', ' ')
}
