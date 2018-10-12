'use strict';

let log = require('./libs/log.js').logger;
let httpLib = require('./libs/http.js');
let authorization = require('./libs/authorization.js');
let status = require('./models/status.js');

/**
 * Routes
 */
class Routes {
    /**
     * Authentification route
     * @param {Object} request
     * @param {Object} response
     * @param {Object} next
     * @param {Object} store - Store Fortunejs
     */
    auth(request, response, next, store) {
        let body = [];
        request.on('error', (err) => {
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
    }

    /**
     * Status route
     * @param {Object} request
     * @param {Object} response
     * @param {Object} next
     * @param {Object} database - Database connection
     */
    status(request, response, next, database) {
        status.get(database)
        .then((result) => {
            return httpLib.sendAPIData(response, 200, {status: result});
        }).catch((error) => {
            log.warn('Get status fail');
            return httpLib.sendAPIError(response, 500, error.message);
        });
    }
}

module.exports = new Routes();
