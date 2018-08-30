/**
 * Post hook
 */

'use stricts';

const {methods, message} = require('fortune');

const httpLib = require('../../libs/http.js');
const aclLib = require('../../libs/acl.js');

function Post() {}

/**
* Post input hook
* @param {object} context - Request context
* @param {object} record
* @param {object} update
*/
Post.prototype.input = (context, record, update) => {
    const {request: {method, meta: {language, request: {user}}}} = context;

    switch (method) {
        case methods.create:
            httpLib.checkRequestParams(['title', 'text'], record, language);
            var {title, text, tags} = record;
            var dateCreated = new Date();
            var dateUpdated = new Date();
            var author = user.member.id;

            if (typeof(record.author) !== 'undefined' && author != record.author) {
                throw new Error(message('ForbidenRelationship', language, {relation: record.author}));
            }

            tags = tags && Array.isArray(tags) ? tags : [];

            return Object.assign({title, text, tags, author, dateCreated});
        case methods.update:
            if (update.replace) {
                // Only title, text and tags can be updated
                const { replace: { title, text, tags } } = update
                update.replace = { title, text, tags }
                Object.assign(
                    update.replace,
                    {
                        dateCreated: record.dateCreated,
                        dateUpdated: new Date()
                    }
                )
            }

            // We can only update our own post
            if (!aclLib.isAdmin(user.member) && user.member.id != record.author) {
                throw new Error(message('InvalidAuthorization', language, {field: 'author'}));
            }

            return true;
        case methods.delete:
            // We can only delete our own post
            if (!aclLib.isAdmin(user.member) && user.member.id != record.author) {
                throw new ForbiddenError(message('InvalidAuthorization', language, {field: 'author'}));
            }
    }
};

module.exports = new Post();
