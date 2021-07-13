const search = require('../libs/search.js');
const fortuneHTTP = require('fortune-http');
const jsonApiSerializer = require('fortune-json-api');
const log = require('../libs/log.js').logger;
const httpLib = require('../libs/http.js');
const config = require('../config/config.js');
const store = require('../libs/store.js');

const listener = fortuneHTTP(store, {
    serializers: [
        [jsonApiSerializer, {maxLimit: config.resultLimit}],
    ],
});

module.exports = (request, response) => {
    let isSearchRequest = true;
    // Check if request contain a search query parameters in a first time
    search.searchEngine(request)
        .then((result) => {
            if (result) {
                if (result.found) {
                    log.debug('Search result founds, redirect: ' + result.redirectUri);
                    response.redirect(result.redirectUri);
                } else {
                    return httpLib.sendAPIData(response, 204, {});
                }
            } else {
                isSearchRequest = false;
                // Call the fortuneJS listener if url doesn't contain search query parameters
                return listener(request, response);
            }
        }).catch((error) => {
            if (isSearchRequest) {
                log.error('Search error: ' + error.message);
                return httpLib.sendAPIError(response, error.code ? error.code : 500, error.message);
            } else {
                log.error('Server error: ' + error.stack);
            }
        });
};

