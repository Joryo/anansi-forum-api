'use strict';
let {errors: {NotFoundError}, message} = require('fortune');

let httpLib = require('../libs/http.js');
let mailer = require('../libs/mail.js');
let aclLib = require('../libs/acl.js');

module.exports = (request, response, store) => {
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
};
