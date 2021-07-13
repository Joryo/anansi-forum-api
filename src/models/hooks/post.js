const {methods} = require('fortune');
const httpLib = require('../../libs/http.js');
const hooksLib = require('../../libs/hooks.js');

module.exports = {
    input: (context, record, update) => {
        const {request: {method, meta: {request: {user}}}} = context;

        switch (method) {
            case methods.create:
                return createPost(record, user);
            case methods.update:
                return updatePost(record, update, user);
            case methods.delete:
                hooksLib.checkLoggedMemberCanUpdateOrDeleteRecord(user.member, record.author, 'id');
        }
    },
};

const createPost = (record, user) => {
    httpLib.checkRequestParams(['title', 'text'], record);
    let {title, text, tags} = record;
    let author = user.member.id;
    let dateCreated = new Date();
    let dateUpdated = new Date();

    tags = tags && Array.isArray(tags) ? tags : [];

    return Object.assign({title, text, tags, author, dateCreated, dateUpdated});
};

const updatePost = (record, update, user) => {
    if (update.replace) {
        // Only title, text and tags can be updated
        const {replace: {title, text, tags}} = update;
        update.replace = {title, text, tags};
        Object.assign(
            update.replace,
            {
                dateCreated: record.dateCreated,
                dateUpdated: new Date(),
            }
        );
    }
    hooksLib.checkLoggedMemberCanUpdateOrDeleteRecord(user.member, record.author, 'id');

    return true;
};
