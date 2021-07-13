/**
 * Member hook
 */

'use strict';

let {methods, errors: {BadRequestError, ForbiddenError}, message} = require('fortune');
let validator = require('email-validator');
let md5 = require('md5');

let httpLib = require('../../libs/http.js');
let aclLib = require('../../libs/acl.js');
let db = require('../../libs/database.js');

function Member() {}

/**
* Member input hook
* @param {object} context - Request context
* @param {object} record
* @param {object} update
*/
Member.prototype.input = (context, record, update) => {
    let {request: {method, meta: {language, request: {user}}}} = context;
    let member = {};
    let role = 'registered';

    switch (method) {
        case methods.create:
            httpLib.checkRequestParams(['email', 'password'], record, language);
            let {email, password, pseudo} = record;
            if (!validator.validate(email)) {
                throw new BadRequestError(message('InvalidMail', language, {email}));
            }
            let dateCreated = new Date();

            // Give default pseudo if necessary
            if (typeof record.pseudo == 'undefined') {
                pseudo = email.split('@', 1)[0];
            }
            password = aclLib.cryptPassword(password);
            member = Object.assign({email, password, role, pseudo, dateCreated});

            return member;
        case methods.update:
            // Only admin can change role and dateCreated. And people can only change their own fields
            if (!aclLib.isAdmin(user.member)) {
                if (typeof(update.replace.role) !== 'undefined') {
                    throw new ForbiddenError(message('ForbiddenUpdate', language, {field: 'role'}));
                } else if (typeof(update.replace.dateCreated) !== 'undefined') {
                    throw new ForbiddenError(message('ForbiddenUpdate', language, {field: 'dateCreated'}));
                } else if (user.member.id != record.id) {
                    throw new ForbiddenError(message('InvalidAuthorization', language, {field: 'id'}));
                }
            }

            // Revoke JWT token if update performed by other user (admin)
            if (user.member.id != record.id) {
                aclLib.revokeToken(record.id);
            }

            if (typeof(update.replace.password) !== 'undefined') {
                update.replace.password = aclLib.cryptPassword(update.replace.password);
            }

            return update;
        case methods.delete:
            // We can only delete our own account
            if (!aclLib.isAdmin(user.member) && user.member.id != record.id) {
                throw new ForbiddenError(message('InvalidAuthorization', language, {field: 'id'}));
            }
    }
};

/**
* Member output hook
* @param {object} context - Request context
* @param {object} record
*/
Member.prototype.output = (context, record) => {
    let {response, request: {method, meta}} = context;

    // If a new member has been created, we send the JWT Token in the response
    if (method == 'create') {
        response.meta = aclLib.getHeaderWithToken(record);
        delete record.password;
        record.token = response.meta.headers.Authorization;
    }

    if (httpLib.isClientRequest(context)) {
        if (typeof(meta.request.user) != 'undefined') {
            let member = meta.request.user.member;
            // The unhashed email can only be seen by the admins or the connected user
            if (member.attributes.email != record.email && !aclLib.isAdmin(member)) {
                record.email = md5(record.email);
            }
            if (aclLib.isSuperAdmin(member)) {
                record.role = 'superadmin';
            }
        }
        delete record.password;
    }
};

module.exports = new Member();
