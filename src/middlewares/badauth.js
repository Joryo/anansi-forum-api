let httpLib = require('../libs/http.js');
let log = require('../libs/log.js').logger;

module.exports = (error, request, response, next) => {
    if (error.name === 'UnauthorizedError') {
        log.verbose('Bad authorization:' + request.originalUrl);
        return httpLib.sendAPIError(response, 401, error.message);
    }
    next();
};
