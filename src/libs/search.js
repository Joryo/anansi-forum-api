let config = require('../config/search.js');
let appConfig = require('../config/config.js');
let database = require('./database.js');
let querystring = require('querystring');

/**
 * Search library
 *
 * @todo use async function instead of Promise
 */
class Search {
    /**
     * Process a search request if a search function exist for the query
     *
     * If the request ask for a search, the search engine request database and return a url for fortunejs with
     * ids as search result
     * @param {Object} request - Full request of the client on the server
     * @return {Promise}
     */
    searchEngine(request) {
        return new Promise((resolve, reject) => {
            let db = database.getConnection();
            if (!db) {
                reject({message: 'database not initialized'});
            }
            if (((request || {}).query || {}).search) {
                let record = request._parsedUrl.pathname.slice(1, -1);
                let searchField = Object.keys(request.query.search)[0];
                let searchValue = request.query.search[searchField];
                let range = Search.prototype.getRange(request.query);
                if ((config[record] || {})[searchField]) {
                    let callable = config[record][searchField];
                    Search.prototype[callable](db, searchValue, range)
                        .then((result) => {
                            // If a result was found, reinsert query string at the end of the redirection url
                            if (result.found) {
                                delete request.query.search;
                                delete request.query.page;
                                result.redirectUri = result.redirectUri + '?' + querystring.stringify(request.query);
                            }
                            resolve(result);
                        }).catch((error) => {
                            reject(error);
                        });
                }
            } else {
                resolve(false);
            }
        });
    }

    /**
     * Get offset and limit of the client request query on the url
     * @param {Object} query - Client query
     * @return {Object} limit and offset
     */
    getRange(query) {
        let limit = appConfig.resultLimit;
        let offset = 0;
        if (query.page) {
            if (query.page.limit && query.page.limit < limit) {
                limit = query.page.limit < limit ? query.page.limit : limit;
            }
            if (query.page.offset) {
                offset = query.page.offset;
            }
        }
        return {limit: limit, offset: offset};
    }

    /**
     * Search function for post title
     * @param {Object} db - Database
     * @param {String} title - Title to search
     * @param {Object} range - Search range
     * @return {Promise}
     */
    searchPostByTitle(db, title, range) {
        return new Promise((resolve, reject) => {
            const collection = db.collection('post');
            collection
                .find({'$text': {'$search': title}})
                .skip(parseInt(range.offset))
                .limit(parseInt(range.limit))
                .toArray(function(err, docs) {
                    if (err) {
                        reject(err);
                    }
                    let ids = docs.map((e) => {
                    return e._id;
                    });
                    if (ids.length) {
                        resolve({found: true, redirectUri: '/posts/' + ids.join(',')});
                    } else {
                        resolve({found: false});
                    }
                });
        });
    }
}

module.exports = new Search();
