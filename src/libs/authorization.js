let {errors: {BadRequestError, UnauthorizedError}, message} = require('fortune');
let bcrypt = require('bcrypt');
let acl = require('./acl.js');

/**
 * Member authorization library
 */
class Authorization {
    /**
     * Send JWT Token if authentification is a success
     * @param {Object} store - Store Fortunejs
     * @param {Object} body - Request parameters (ex: {login: 'toto', password: 'toto.mdp'}).
     * @return {Promise}
     */
    getAuthorization(store, body) {
        return new Promise(function(resolve, reject) {
            const credentials = JSON.parse(body);
            if (!credentials.email) {
                reject(new BadRequestError(message('MissingField', 'en', {field: 'email'})));
            }
            if (!credentials.password) {
                reject(new BadRequestError(message('MissingField', 'en', {field: 'password'})));
            }
            // Search the member
            store.find('member', null, {match: {email: [credentials.email]}, limit: 1})
                .then((result) => {
                    const member = result.payload.records[0];
                    if (member) {
                        // Check password
                        if (bcrypt.compareSync(credentials.password, member.password)) {
                            return resolve(acl.getToken(member, false));
                        }
                    }
                    return reject(new UnauthorizedError(message('InvalidCredentials', 'en')));
                }).catch(() => {
                    reject(new UnauthorizedError(message('InvalidCredentials', 'en')));
                });
        });
    }
}

module.exports = new Authorization();
