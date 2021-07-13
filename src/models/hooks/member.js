const {methods, errors: {BadRequestError, ForbiddenError}, message} = require('fortune');
const validator = require('email-validator');
const md5 = require('md5');
const httpLib = require('../../libs/http.js');
const aclLib = require('../../libs/acl.js');
const hooksLib = require('../../libs/hooks.js');

module.exports = {
    input: (context, record, update) => {
        let {request: {method, meta: {request: {user}}}} = context;
        switch (method) {
            case methods.create:
                return createMember(record);
            case methods.update:
                return updateMember(record, update, user);
            case methods.delete:
                hooksLib.checkLoggedMemberCanUpdateOrDeleteRecord(user.member, record.id, 'id');
        };
    },
    output: (context, record) => {
        formatMemberOutput(context, record);
    },
};

const createMember = (record) => {
    httpLib.checkRequestParams(['email', 'password'], record);
    let {email, password, pseudo} = record;
    let role = 'registered';
    if (!validator.validate(email)) {
        throw new BadRequestError(message('InvalidMail', 'en', {email}));
    }
    let dateCreated = new Date();

    // Give default pseudo if necessary
    if (typeof record.pseudo == 'undefined') {
        pseudo = email.split('@', 1)[0];
    }
    password = aclLib.cryptPassword(password);

    return Object.assign({email, password, role, pseudo, dateCreated});
};

const updateMember = (record, update, user) => {
    // Only admin can change role and dateCreated. And non admin can only change their own fields
    if (!aclLib.isAdmin(user.member)) {
        if (typeof(update.replace.role) !== 'undefined') {
            throw new ForbiddenError(message('ForbiddenUpdate', 'en', {field: 'role'}));
        } else if (typeof(update.replace.dateCreated) !== 'undefined') {
            throw new ForbiddenError(message('ForbiddenUpdate', 'en', {field: 'dateCreated'}));
        } else if (user.member.id != record.id) {
            throw new ForbiddenError(message('InvalidAuthorization', 'en', {field: 'id'}));
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
};

const formatMemberOutput = (context, record) => {
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
