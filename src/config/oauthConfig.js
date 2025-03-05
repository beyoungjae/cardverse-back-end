const OIDCStrategy = require('../services/strategies/OIDCStrategy')
const OAuth2Strategy = require('../services/strategies/OAuth2Strategy')

const oauthConfig = {
   kakao: {
      authUrl: 'https://kauth.kakao.com/oauth/token',
      userInfoUrl: 'https://kapi.kakao.com/v2/user/me',
      clientId: process.env.KAKAO_CLIENT_ID,
      redirectUri: process.env.KAKAO_REDIRECT_URI || 'http://localhost:3000/login',
      strategy: new OIDCStrategy(), // ✅ OIDC 방식 사용
   },
   google: {
      authUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      clientId: process.env.GOOGLE_CLIENT_ID,
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/login',
      strategy: new OIDCStrategy(), // ✅ OIDC 방식 사용
   },
   naver: {
      authUrl: 'https://nid.naver.com/oauth2.0/token',
      userInfoUrl: 'https://openapi.naver.com/v1/nid/me',
      clientId: process.env.NAVER_CLIENT_ID,
      redirectUri: process.env.NAVER_REDIRECT_URI || 'http://localhost:3000/login',
      strategy: new OAuth2Strategy('https://openapi.naver.com/v1/nid/me'), // ✅ OAuth2 방식 사용
   },
   github: {
      authUrl: 'https://github.com/login/oauth/access_token',
      userInfoUrl: 'https://api.github.com/user',
      clientId: process.env.GITHUB_CLIENT_ID,
      redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/login',
      strategy: new OAuth2Strategy('https://api.github.com/user'), // ✅ OAuth2 방식 사용
   },
}

module.exports = oauthConfig
