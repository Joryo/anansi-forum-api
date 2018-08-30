/**
 * Tag hook
 */

'use strict';

let {methods, errors: {ForbiddenError}, message} = require('fortune');

let httpLib = require('../../libs/http.js');
const aclLib = require('../../libs/acl.js');

function Tag() {}

/**
* Tag input hook
* @param {object} context - Request context
* @param {object} record
* @param {object} update
*/
Tag.prototype.input = (context, record, update) => {
    let {request: {method, meta: {language}}} = context;

    switch (method) {
        case methods.create:
            httpLib.checkRequestParams(['text', 'color'], record, language);
            let {text, color} = record;

            return Object.assign({text, color});
    }
};

module.exports = new Tag();
