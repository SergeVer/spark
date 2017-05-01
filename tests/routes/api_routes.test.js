// This is magically used in code such as user.attributes.password.length.should.be.above(20);
const should = require('chai').should(); // eslint-disable-line no-unused-vars
const Cookies = require('expect-cookies');
const app = require('../../app');
const request = require('supertest')(app);
const assert = require('assert');
const {SessionCookieName, InvalidTokenCookie, TestValidCredentials, TestInvalidCredentials, UserLoginUrl, withSessionCookie, generateSessionCookie, generateSessionHeader} = require('../drivers/auth-test-support');

describe('API routes', function() {

    before(() => request.get('/dev/create-admin'));

    it('should reject with no token', () =>
        request.post(UserLoginUrl)
               .expect(401));

    it('should reject with invalid login', () =>
        request.post(UserLoginUrl)
               .send(TestInvalidCredentials)
               .expect(401));

    it('should reject with invalid token', () =>
        request.post(UserLoginUrl)
               .set('Cookie', InvalidTokenCookie)
               .expect(401));

    it('should reject with valid auth header', () =>
        request.post(UserLoginUrl)
               .set({'authorization': generateSessionHeader()})
               .expect(200));

    it('should set cookie when login is successful', () =>
        request.post(UserLoginUrl)
               .send(TestValidCredentials)
               .expect(200)
               .expect(Cookies.new({'name': SessionCookieName, 'options': ['path', 'httponly', 'max-age']})));

    it('should be not redirect to login in case token exists', () =>
        request.post(UserLoginUrl)
               .set('Cookie', generateSessionCookie())
               .expect(200));

    it('should return 200OK if encountered valid token', () =>
        request.post(UserLoginUrl)
              .send(TestValidCredentials)
              .then(res => {
                  if (res.status !== 200) assert.fail(res.status, 200, "login failed");
                  const sessionToken = res.headers['set-cookie'][0].split(';')[0].split('=')[1];
                  console.log(`login with token [${sessionToken}]`);
                  return request.post(UserLoginUrl)
                                .set('Cookie', withSessionCookie(sessionToken))
                                .expect(200);
              }));
});
