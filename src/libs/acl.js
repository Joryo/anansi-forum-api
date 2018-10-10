'use strict';

let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let {errors: {ForbiddenError, UnauthorizedError, NotFoundError}, message} = require('fortune');

let aclConfig = require('../config/acl.js');
let config = require('../config/config.js');
let database = require('./database.js');
let log = require('./log.js').logger;

/**
 * Access Control List library
 */
class Acl {
    /**
     * Check if a member has access to a ressource
     * @param {String} method Http call method (GET, POST..)
     * @param {String} url Called url
     * @param {Object} user Connected user
     * @param {string} language
     * @return {Bool} true if member has access to the ressource
     */
    async canAccess(method, url, user, language) {
        let member = {id: 0, attributes: {email: 'guest', role: 'guest'}};
        if (typeof (user) !== 'undefined') {
            member = user.member;
        }
        let isRevoked;
        try {
            isRevoked = await module.exports.tokenIsRevoked(member.id);
        } catch (error) {
            log.error('Fail ro get revoked token');
            throw new UnauthorizedError(message('ExpiredToken', language));
        }
        if (isRevoked) {
            throw new UnauthorizedError(message('ExpiredToken', language));
        }
        url = url.split('?')[0].split('/')[1];
        method = method.toLowerCase();
        if (method == 'put') {
            method = 'patch';
        }
        // If the member is registered as superadmin in .env file, he can access all resources
        if (module.exports.isSuperAdmin(member)) {
            return true;
        }
        // Check member token
        if (!member.attributes || !member.attributes.role || !member.attributes.email) {
            log.warn('Token malformed');
            throw new UnauthorizedError(message('MalformedToken', language));
        }
        // Role doesn't exist
        if (typeof (aclConfig.roles[member.attributes.role]) === 'undefined') {
            throw new ForbiddenError(message('InvalidRole', language));
        }
        // The resources path is not registered in acl config
        if (typeof (aclConfig.authorizations[url]) === 'undefined'
            || typeof (aclConfig.authorizations[url][method]) === 'undefined') {
            throw new NotFoundError();
        }
        let authorizedRole = aclConfig.authorizations[url][method];
        if (aclConfig.roles[member.attributes.role] >= aclConfig.roles[authorizedRole]) {
            return true;
        }
        // The member can't access the resource
        throw new ForbiddenError(message('BadRole', language, {authorizedRole: authorizedRole}));
    }
    /**
     * Indicates if the member is admin
     *
     * @param  {member} member Member
     * @return {bool}
     */
    isAdmin(member) {
        if (typeof (member.attributes) !== 'undefined') {
            member = member.attributes;
        }
        return (member.role == 'admin')
            || module.exports.isSuperAdmin(member);
    }
    /**
     * Indicates if the member is superadmin
     *
     * @param  {member} member Member
     * @return {bool}
     */
    isSuperAdmin(member) {
        if (typeof (member.attributes) !== 'undefined') {
            member = member.attributes;
        }
        return aclConfig.superAdmins == member.email;
    }
    /**
     * Crypt member password
     *
     * @param  {string} password Password
     * @return {string} Password crypted
     */
    cryptPassword(password) {
        let salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }
    /**
     * Return header with JWT Token
     *
     * @param  {object} member Member
     * @return {object} Header
     */
    getHeaderWithToken(member) {
        let tokenMember = {
            id: member.id,
            attributes: {
                email: member.email,
                pseudo: member.pseudo,
                role: member.role,
            },
        };
        let token = jwt.sign({member: tokenMember}, process.env.JWT_SECRET, {expiresIn: config.tokenExpireTime});
        return {
            headers: {
                Authorization: token,
            },
        };
    }
    /**
     * Check if JWT member Token is revoked
     *
     * @param  {int} memberId
     * @return {bool} true if token is revoked
     */
    async tokenIsRevoked(memberId) {
        let result = await database.getConnection().collection('jwt').findOne({id: memberId});
        return result ? true : false;
    }
    /**
     * Revoke JWT member Token
     *
     * @param  {int} memberId
     */
    async revokeToken(memberId) {
        database.getConnection().collection('jwt').insertOne({id: memberId});
    }
    /**
     * Delete a revoked JWT member Token if exist
     *
     * @param  {int} memberId
     */
    clearRevokeToken(memberId) {
        database.getConnection().collection('jwt').deleteMany({id: memberId});
    }
}

module.exports = new Acl();
