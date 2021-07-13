'use strict';

let log = require('../libs/log.js').logger;
let httpLib = require('../libs/http.js');
let authorization = require('../libs/authorization.js');

module.exports = (request, response) => {
    let body = [];
    request.on('error', () => {
        response.statusCode = 400;
        return response.end();
    }).on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        authorization.getAuthorization(store, body, 'en')
            .then((token) => {
                log.debug('Authentification success');
                return httpLib.sendAPIData(response, 200, {token: token});
            }).catch((error) => {
                log.debug('Authentification fail');
                return httpLib.sendAPIError(response, 401, error.message);
            });
    });
};