'use strict';
let {errors: {NotFoundError}, message} = require('fortune');

let httpLib = require('./libs/http.js');
let authorization = require('./libs/authorization.js');
let status = require('./models/status.js');
let mailer = require('./libs/mail.js');
let aclLib = require('./libs/acl.js');
let log = require('./libs/log.js').logger;

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

    /**
     * Lost password route
     * Send an email to the user email for reset his password
     * The request need this element in the body:
     * email: The email of the user who lost his password
     * subject: The mail subject
     * text: The main text of the mail
     * redirect_url: The redirection in the mail (the end of the redirection
     *   will be filled with the JWT token of the user)
     * redirect_label: The redirection link label
     * @param {Object} request
     * @param {Object} response
     * @param {Object} store - Store fortuneJs
     */
    lostPassword(request, response, store) {
        let body = [];
        request.on('error', (err) => {
            response.statusCode = 400;
            return response.end();
        }).on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            // Read request parameters
            body = Buffer.concat(body).toString();
            const data = JSON.parse(body);
            const fields = ['email', 'subject', 'text', 'redirect_url', 'redirect_label'];
            for (let index = 0; index < fields.length; index++) {
                if (typeof(data[fields[index]]) === 'undefined') {
                    return httpLib.sendAPIError(
                        response,
                        400,
                        message('MissingField', request.language, {field: fields[index]})
                    );
                }
            }
            store.find('member', null, {match: {email: [data.email]}, limit: 1})
            .then((result) => {
                // Get the member from email
                if (result.payload.count == 0) {
                    throw new NotFoundError(message('NotFoundError', request.language));
                }
                return result.payload.records[0];
            }).then((member) => {
                // Send a mail with the JWT token inside
                const token = aclLib.getToken(member, true);
                return mailer.send(
                    data.email,
                    data.subject,
                    '<p>' + data.text + '</p><a href="' + data.redirect_url + token + '">'
                    + data.redirect_label + '</a>');
            }).then(() => {
                return httpLib.sendAPIData(response, 204);
            }).catch((error) => {
                return httpLib.sendAPIError(response, error.httpCode, error.message);
            });
        });
    }
}

module.exports = new Routes();
