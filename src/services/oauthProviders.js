const { OAuthService } = require('./oauthService')
const OIDCStrategy = require('./strategies/OIDCStrategy')
const OAuth2Strategy = require('./strategies/OAuth2Strategy')

// ✅ OIDC 지원 (카카오, 구글, 애플)
const kakaoAuth = new OAuthService(new OIDCStrategy())
const googleAuth = new OAuthService(new OIDCStrategy())

// ✅ OAuth2.0만 지원 (네이버, 깃허브, 페이스북)
const naverAuth = new OAuthService(new OAuth2Strategy('https://openapi.naver.com/v1/nid/me'))
const githubAuth = new OAuthService(new OAuth2Strategy('https://api.github.com/user'))
const facebookAuth = new OAuthService(new OAuth2Strategy('https://graph.facebook.com/me'))

module.exports = {
   kakaoAuth,
   googleAuth,
   naverAuth,
   githubAuth,
   facebookAuth,
}
