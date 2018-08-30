'use strict';

let {errors: {BadRequestError, UnauthorizedError}, message} = require('fortune');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcrypt');

let config = require('../config/config.js');
let acl = require('./acl.js');

/**
 * Member authorization library
 */
class Authorization {
    /**
     * Send JWT Token if authentification is a success
     * @param {Object} store - Store Fortunejs
     * @param {Object} body - Request parameters (ex: {login: 'toto', password: 'toto.mdp'}).
     * @param {String} language - language (ex: 'fr')
     * @return {Promise}
     */
    getAuthorization(store, body, language) {
        return new Promise(function(resolve, reject) {
            const credentials = JSON.parse(body);
            if (!credentials.email) {
                reject(new BadRequestError(message('MissingField', language, 'email')));
            }
            if (!credentials.password) {
                reject(new BadRequestError(message('MissingField', language, 'password')));
            }
            // Search the member
            store.find('member', null, {match: {email: [credentials.email]}, limit: 1})
                .then((result) => {
                    const member = result.payload.records[0];
                    if (member) {
                        // Check password
                        if (bcrypt.compareSync(credentials.password, member.password)) {
                            // Format the member data for token insertion
                            let tokenMember = {
                                id: member.id,
                                attributes: {
                                    email: member.email,
                                    pseudo: member.pseudo,
                                    role: member.role,
                                },
                            };
                            // Send the JWT Token
                            const token = jwt.sign({member: tokenMember},
                                process.env.JWT_SECRET, {expiresIn: config.tokenExpireTime});
                            acl.clearRevokeToken(member.id);
                            return resolve(token);
                        }
                    }
                    return reject(new UnauthorizedError(message('InvalidCredentials', language)));
                }).catch((error) => {
                    reject(new UnauthorizedError(message('InvalidCredentials', language)));
                });
        });
    }
}

module.exports = new Authorization();
