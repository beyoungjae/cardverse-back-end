exports.snakeToCamel = (obj) => {
   if (Array.isArray(obj)) {
      return obj.map(exports.snakeToCamel)
   } else if (obj !== null && typeof obj === 'object') {
      return Object.fromEntries(
         Object.entries(obj).map(([key, value]) => [
            key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()), // 스네이크 → 카멜
            exports.snakeToCamel(value), // 재귀 호출 (중첩 객체 처리)
         ]),
      )
   }
   return obj
}

exports.camelToSnake = (obj) => {
   if (Array.isArray(obj)) {
      return obj.map(exports.camelToSnake)
   } else if (obj !== null && typeof obj === 'object') {
      return Object.fromEntries(
         Object.entries(obj).map(([key, value]) => [
            key.replace(/([A-Z])/g, '_$1').toLowerCase(), // 카멜 → 스네이크
            exports.camelToSnake(value), // 재귀 호출 (중첩 객체 처리)
         ]),
      )
   }
   return obj
}
