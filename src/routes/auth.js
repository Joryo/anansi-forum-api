let store = require('../libs/store.js');
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
        authorization.getAuthorization(store, body)
            .then((token) => {
                return httpLib.sendAPIData(response, 200, {token: token});
            }).catch((error) => {
                return httpLib.sendAPIError(response, 401, error.message);
            });
    });
};