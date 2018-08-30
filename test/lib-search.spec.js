const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const assert = require('chai').assert;
const proxyquire = require('proxyquire');

const searchConfig = {
    'post':
        {
            'title': 'searchPostByTitle',
        },
};

const appConfig = {
    'resultLimit': 20,
};

const dbMock = {
    getConnection: () => ({
        collection: () => ({
            find: () => ({
                skip: () => ({
                    limit: () => ({
                        toArray: (cb) => {
                            cb(null, [
                                {_id: 101},
                                {_id: 102},
                            ]);
                        },
                    }),
                }),
            }),
        }),
    }),
};

let sandbox;

describe('Search Library', () => {
    before(() => {
      chai.use(sinonChai);
      chai.should();
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.search = proxyquire('../src/libs/search.js', {
            '../config/search.js': searchConfig,
            '../config/config.js': appConfig,
            './database.js': dbMock,
        });
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('searchEngine', () => {
        it('should resolve promise with redirect uri if a search result is found', () => {
            const request = {
                _parsedUrl: {pathname: '/posts'},
                query: {search: {title: 'title_post'}, page: {limit: 2, offset: 2}},
            };
            return sandbox.search.searchEngine(request)
            .then((result) => {
                assert.deepEqual(result, {found: true, redirectUri: '/posts/101,102?'});
                assert(true, 'promise resolved');
            }).catch((error) => {
                assert(false, 'promise rejected ' + error.message);
            });
        });

        it('should resolve promise with empty result uri if a search result is not found', () => {
            const request = {
                _parsedUrl: {pathname: '/posts'},
                query: {search: {title: 'title_post'}, page: {limit: 2, offset: 2}},
            };
            const dbMock = {
                getConnection: () => ({
                    collection: () => ({
                        find: () => ({
                            skip: () => ({
                                limit: () => ({
                                    toArray: (cb) => {
                                        cb(null, []);
                                    },
                                }),
                            }),
                        }),
                    }),
                }),
            };
            sandbox.search = proxyquire('../src/libs/search.js', {
                '../config/search.js': searchConfig,
                '../config/config.js': appConfig,
                './database.js': dbMock,
            });

            return sandbox.search.searchEngine(request)
            .then((result) => {
                assert.deepEqual(result, {found: false});
                assert(true, 'promise resolved');
            }).catch((error) => {
                assert(false, 'promise rejected or found not false ' + error.message);
            });
        });

        it('should reject promise if the request doesn\'t contain request', () => {
            const request = {
                _parsedUrl: {pathname: '/posts'},
                query: {},
            };

            return sandbox.search.searchEngine(request)
            .then((result) => {
                assert.deepEqual(result, {found: false});
                assert(false, 'promise resolved');
            }).catch(() => {
                assert(true, 'promise rejected');
            });
        });
    });


    describe('getRange', () => {
        it('should return request query range asked by client if limit is under server limit', () => {
            const query = {search: {title: 'title_post'}, page: {limit: 2, offset: 2}};
            const result = sandbox.search.getRange(query);
            assert.deepEqual(result, {limit: 2, offset: 2});
        });

        it('should return request query range with server limit if limit is higher than server limit', () => {
            const query = {search: {title: 'title_post'}, page: {limit: 1000, offset: 2}};
            const result = sandbox.search.getRange(query);
            assert.deepEqual(result, {limit: 20, offset: 2});
        });
    });
});
