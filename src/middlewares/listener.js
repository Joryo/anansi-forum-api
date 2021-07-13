let search = require('../libs/search.js');
let fortuneHTTP = require('fortune-http');
let jsonApiSerializer = require('fortune-json-api');
let log = require('../libs/log.js').logger;
let httpLib = require('../libs/http.js');
let config = require('../config/config.js');
let store = require('../libs/store.js');

let listener = fortuneHTTP(store, {
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

