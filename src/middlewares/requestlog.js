let log = require('../libs/log.js').logger;

module.exports = (request, _, next) => {
    log.verbose('Request received: ' + request.originalUrl);
    next();
};