const cache = new Map()
const CACHE_TTL = 1000 * 60 * 60

// 로그인 정보 저장
function setUser(userId, provider, role, accessToken) {
   console.group('셋유저시작')
   console.log(userId)
   console.log(provider)
   console.log(role)
   console.log(accessToken)
   console.groupEnd('셋유저끝')
   const timestamp = Date.now()
   cache.set(userId, { provider, accessToken, role, timestamp })

   // 일정 시간이 지나면 자동 삭제
   setTimeout(() => {
      cache.delete(userId)
   }, CACHE_TTL)
}

// 로그인 정보 가져오기
function getUser(userId) {
   const data = cache.get(userId)
   if (!data) return null

   // 만료된 데이터 확인
   if (Date.now() - data.timestamp > CACHE_TTL) {
      cache.delete(userId)
      return null
   }

   return data
}

// 로그인 정보 삭제 (로그아웃)
function removeUser(userId) {
   cache.delete(userId)
}

// 현재 로그인된 모든 사용자 보기 (디버깅용)
function getAllUsers() {
   return [...cache.entries()]
}

module.exports = { setUser, getUser, removeUser, getAllUsers }
