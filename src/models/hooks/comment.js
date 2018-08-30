/**
 * Comment hook
 */

'use strict';

let {methods, message} = require('fortune');
let httpLib = require('../../libs/http.js');
let aclLib = require('../../libs/acl.js');

function Comment() {}

/**
* Comment input hook
* @param {object} context - Request context
* @param {object} record
* @param {object} update
*/
Comment.prototype.input = (context, record, update) => {
    const {request: {method, meta: {language, request: {user}}}} = context;

    switch (method) {
        case methods.create:
            httpLib.checkRequestParams(['text', 'post'], record, language);
            let {post, text} = record;
            let dateCreated = new Date();
            let author = user.member.id;

            if (typeof(record.author) !== 'undefined' && author != record.author) {
                throw new Error(message('ForbidenRelationship', language, {relation: record.author}));
            }

            return Object.assign({text, post, author, dateCreated});
        case methods.update:
            if (update.replace) {
                // Only text can be updated
                const { replace: {text } } = update
                update.replace = { text }
                Object.assign(
                    update.replace,
                    {
                        dateCreated: record.dateCreated,
                        dateUpdated: new Date()
                    }
                )
            }

            // We can only update our own comment
            if (!aclLib.isAdmin(user.member) && user.member.id != record.author) {
                throw new Error(message('InvalidAuthorization', language, {field: 'author'}));
            }

            return true;
        case methods.delete:
            // We can only delete our own comment
            if (!aclLib.isAdmin(user.member) && user.member.id != record.author) {
                throw new ForbiddenError(message('InvalidAuthorization', language, {field: 'id'}));
            }
    }
};

module.exports = new Comment();
