const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const assert = require('chai').assert;

const aclConfigMock = {
    superAdmins: [
        'superadmin@forum.com',
    ],
    roles: {
        guest: 0,
        registered: 1,
        admin: 2,
    },
    authorizations: {
        members: {
            post: 'guest',
            get: 'registered',
            delete: 'admin',
            patch: 'registered',
        },
    },
};

const logMock = {
    warn: () => { },
    error: () => { },
};

const shouldThrowError = (sandbox, method, url, user, errorName) => {
    return sandbox.acl.canAccess(method, url, user, 'en')
        .then(() => {
            assert(false, 'access should not be ok');
        })
        .catch((error) => {
            assert.equal(error.name, errorName);
        });
};

const shouldNotThrowError = (sandbox, method, url, user) => {
    return sandbox.acl.canAccess(method, url, user, 'en')
        .then(() => {
            assert(true, 'access is ok');
        })
        .catch((error) => {
            assert(false, 'access should be ok');
        });
};

let sandbox;

describe('Acl Library', () => {
    before(() => {
        chai.use(sinonChai);
        chai.should();
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.acl = proxyquire('../src/libs/acl.js', {'../config/acl.js': aclConfigMock, './log.js': logMock});
        sandbox.jwt = require('jsonwebtoken');
        sandbox.stub(sandbox.acl, 'tokenIsRevoked').resolves(false);
        sandbox.stub(process, 'env').value({'JWT_SECRET': 'QOSDKFSODFKSOFKSDQOFK'});
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('canAccess', () => {
        it('should resolve promise when the user has sufficient role ', () => {
            return shouldNotThrowError(sandbox, 'GET', '/members', {member: {id: 123, attributes:
                {email: 'test@test.com', role: 'registered'}}});
        });

        it('should resolve promise when the member is a superadmin, even if the request action is not on acl config',
            () => {
            return shouldNotThrowError(sandbox, 'GET', '/unexistantaction', {member: {id: 123, attributes:
                {email: aclConfigMock.superAdmins[0]}}});
        });

        it('should throw UnauthorizedError code when the token doesn\'t contain user email', () => {
            return shouldThrowError(sandbox, 'GET', '/members', {member:
                {id: 123, attributes: {role: 'registered'}}}, 'UnauthorizedError');
        });

        it('should throw UnauthorizedError code when the token doesn\'t contain user role', () => {
            return shouldThrowError(sandbox, 'GET', '/members', {member: {id: 123, attributes:
                {email: 'test@test.com'}}}, 'UnauthorizedError');
        });

        it('should throw ForbiddenError code when the token contain unexistant role', () => {
            return shouldThrowError(sandbox, 'GET', '/members', {member: {id: 123, attributes:
                {email: 'test@test.com', role: 'unexistant_role'}}}, 'ForbiddenError');
        });

        it('should throw NotFoundError code when the requested action is not on acl config', () => {
            return shouldThrowError(sandbox, 'GET', '/unexistantaction', {member: {id: 123, attributes:
                {email: 'test@test.com', role: 'registered'}}}, 'NotFoundError');
        });

        it('should throw ForbiddenError code when the user has insufficient role ', () => {
            return shouldThrowError(sandbox, 'DELETE', '/members', {member: {id: 123, attributes:
                {email: 'test@test.com', role: 'registered'}}}, 'ForbiddenError');
        });
    });

    describe('isAdmin', () => {
        it('should return true if user has admin role', () => {
            const member = {attributes: {role: 'admin'}};
            const result = sandbox.acl.isAdmin(member);
            assert.isTrue(result);
        });

        it('should return true if user is superadmin', () => {
            const member = {attributes: {email: aclConfigMock.superAdmins[0]}};
            const result = sandbox.acl.isAdmin(member);
            assert.isTrue(result);
        });

        it('should return false if useris not admin', () => {
            const member = {attributes: {role: 'register'}};
            const result = sandbox.acl.isAdmin(member);
            assert.isFalse(result);
        });

        it('should return false if user has no role', () => {
            const member = {attributes: {}};
            const result = sandbox.acl.isAdmin(member);
            assert.isFalse(result);
        });
    });

    describe('isSuperAdmin', () => {
        it('should return true if user is superAdmin', () => {
            const member = {email: aclConfigMock.superAdmins[0]};
            const result = sandbox.acl.isSuperAdmin(member);
            assert.isTrue(result);
        });

        it('should return false if user is not superadmin', () => {
            const member = {attributes: {role: 'admin', email: 'o' + aclConfigMock.superAdmins[0]}};
            const result = sandbox.acl.isSuperAdmin(member);
            assert.isFalse(result);
        });
    });

    describe('cryptPassword', () => {
        it('should return a string without clear password inside', () => {
            const password = 'toto';
            const result = sandbox.acl.cryptPassword(password);
            assert.isString(result);
            assert.notEqual(result, password);
            assert.notMatch(result, /toto/, 'password not hashed');
        });
    });
});
