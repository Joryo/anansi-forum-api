const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const assert = require('chai').assert;

let sandbox;

const language = 'en';

const shouldReturnBadRequestError = (sandbox, body) => {
    return sandbox.authorization.getAuthorization({}, body, language)
    .then(() => {
        assert(false);
    }).catch((error) => {
        assert.equal(error.name, 'BadRequestError');
    });
};

describe('Authorization Library', () => {
    before(() => {
      chai.use(sinonChai);
      chai.should();
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.bcryptMock = {};
        sandbox.jwtMock = {};
        sandbox.acl = {
            clearRevokeToken: () => {},
        };
        sandbox.authorization = proxyquire('../src/libs/authorization.js', {
            'bcrypt': sandbox.bcryptMock,
            'jsonwebtoken': sandbox.jwtMock,
            './acl.js': sandbox.acl,
        });
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('getAuthorization', () => {
        it('should resolve a token if credentials are valid', () => {
            const token = 'a token';
            sandbox.bcryptMock.compareSync = (a, b) => {
                return a == b;
            };
            sandbox.jwtMock.sign = (a, b, c) => {
                return token;
            };
            store = {find: (a, b, c) => {
                return Promise.resolve(
                    {payload: {records: [{password: 'user_password'}]}}
                );
            }};

            return sandbox.authorization.getAuthorization(store,
                '{"password": "user_password","email": "user_mail"}', language)
            .then((result) => {
                assert.equal(token, result);
            }).catch((error) => {
                assert(false, 'promise rejected: ' + error.message);
            });
        });

        it('should reject a BadRequestError if email on credentials missing', () => {
            return shouldReturnBadRequestError(
                sandbox,
                '{"password": "user_pass"}'
            );
        });

        it('should reject a BadRequestError if password on credentials missing', () => {
            return shouldReturnBadRequestError(
                sandbox,
                '{"email": "user_mail"}'
            );
        });

        it('should reject a UnauthorizedError if password is invalid', () => {
            store = {find: (a, b, c) => {
                return Promise.resolve(
                    {payload: {records: [{password: 'user_password'}]}}
                );
            }};
            return sandbox.authorization.getAuthorization(store,
                '{"password": "user_password_false","email": "user_mail"}', language)
            .then(() => {
                assert(false, 'promise resolved');
            }).catch((error) => {
                assert.equal(error.name, 'UnauthorizedError');
            });
        });

        it('should reject a UnauthorizedError if user can\'t be found on database', () => {
            store = {find: (a, b, c) => {
                return Promise.reject(false);
            }};
            return sandbox.authorization.getAuthorization(store,
                '{"password": "user_pass","email": "user_mail"}', language)
            .then(() => {
                assert(false, 'promise resolved');
            }).catch((error) => {
                assert.equal(error.name, 'UnauthorizedError');
            });
        });
    });
});
