const {methods} = require('fortune');
const httpLib = require('../../libs/http.js');
const hooksLib = require('../../libs/hooks.js');

module.exports = {
    input: (context, record, update) => {
        const {request: {method, meta: {request: {user}}}} = context;
        switch (method) {
            case methods.create:
                return createComment(record, user);
            case methods.update:
                return updateComment(record, user, update);
            case methods.delete:
                hooksLib.checkLoggedMemberCanUpdateOrDeleteRecord(user.member, record.author, 'id');
        }
    },
};

const createComment = (record, user) => {
    httpLib.checkRequestParams(['text', 'post'], record);
    let {post, text} = record;
    let author = user.member.id;
    let dateCreated = new Date();

    return Object.assign({text, post, author, dateCreated});
};

const updateComment = (record, user, update) => {
    if (update.replace) {
        // Only text can be updated
        const {replace: {text}} = update;
        update.replace = {text};
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
