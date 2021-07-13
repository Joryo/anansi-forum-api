'use strict';

let aclLib = require('../libs/acl.js');
let log = require('../libs/log.js').logger;
let httpLib = require('../libs/http.js');

module.exports = (request, response, next) => {
    aclLib.canAccess(request.method, request.url, request.user)
        .then(() => {
            next();
        }).catch((error) => {
            log.verbose('Forbiden access: ' + request.originalUrl);
            return httpLib.sendAPIError(response, error.httpCode ? error.httpCode : 500, error.message);
        });
};