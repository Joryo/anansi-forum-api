/**
* Anansi Forum API application
*/
'use strict';

// Get env configuration
require('dotenv').config();

// External modules
let fortune = require('fortune');
let fortuneHTTP = require('fortune-http');
let jsonApiSerializer = require('fortune-json-api');
let mongodbAdapter = require('fortune-mongodb');
let cors = require('cors');
let express = require('express');
let jwt = require('express-jwt');
let shortid = require('shortid');
let requestLanguage = require('express-request-language');

// Internal modules
let recordTypes = require('./models/recordTypes.js');
let memberHook = require('./models/hooks/member.js');
let postHook = require('./models/hooks/post.js');
let commentHook = require('./models/hooks/comment.js');
let tagHook = require('./models/hooks/tag.js');
let httpLib = require('./libs/http.js');
let authorization = require('./libs/authorization.js');
let config = require('./config/config.js');
let search = require('./libs/search.js');
let indexes = require('./libs/indexes.js');
let database = require('./libs/database.js');
let log = require('./libs/log.js').logger;
let aclLib = require('./libs/acl.js');

// Get FortuneJS errors
let {message, errors: {UnauthorizedError, NotFoundError, ForbiddenError}} = fortune;

// Error messages
Object.assign(message.en, {
    'InvalidMail': 'Email {email} is not a correct email value',
    'InvalidAuthorization': 'You are not authorized to access this ressource, bad {field}',
    'InvalidCredentials': 'Bad credentials',
    'NotFoundError': 'This ressource do not exist',
    'MissingField': 'Field {field} missing',
    'ForbidenRelationship': 'You can\'t link this resource to relation id {relation}',
    'ForbiddenUpdate': 'You can\'t update this field: {field}',
    'ExpiredToken': 'Your token has expired, please make a new authentification',
    'MalformedToken': 'Your token is malformed, please make a new authentification',
    'InvalidRole': 'Your role is invalid',
    'BadRole': 'you need to be {authorizedRole} for accessing this resource',
});

// Custom fortuneJS errors http response code
UnauthorizedError.prototype.httpCode = 401;
NotFoundError.prototype.httpCode = 404;
ForbiddenError.prototype.httpCode = 403;

/**
* Link fortuneJS to the database
* @type {Object}
*/
let adapter = [
    mongodbAdapter, {
        url: process.env.DB_HOST + '/' + process.env.DB_DATABASE,
        generateId: () => shortid.generate(),
        useNewUrlParser: true,
    },
];

/**
* Input and ouput hooks for FortuneJS records
* @type {Object}
*/
let hooks = {
    member: [memberHook.input, memberHook.output],
    post: [postHook.input, postHook.output],
    comment: [commentHook.input, commentHook.output],
    tag: [tagHook.input, tagHook.output],
};

/**
* FortuneJs store
* @type {Object}
*/
let store = fortune(recordTypes, {hooks, adapter});

/**
* FortuneJS listener.
* Process API client request
* @type {Object}
*/
let listener = fortuneHTTP(store, {
    serializers: [
        [jsonApiSerializer, {maxLimit: config.resultLimit}],
    ],
});

/**
* Express framework
* @type {Object}
*/
let app = express();

// Accepted language
app.use(requestLanguage({
    languages: ['en', 'fr', 'en-US', 'fr-FR'],
}));

// Init app database
database.connect(process.env.DB_HOST, process.env.DB_DATABASE)
    .then((database) => {
        log.verbose('Connection to MongoDB success: ' + process.env.DB_HOST);
        indexes.init(database);
    })
    .catch((error) => {
        log.error(error);
    });

// Cross domain authorization
app.use(cors());

// Authentification check with JWT token
app.use(
    jwt({secret: process.env.JWT_SECRET})
        .unless({path: ['/auth', {url: '/members', methods: ['POST']}]})
);

// Process authentification request
app.use((request, response, next) => {
    log.verbose('Request received: ' + request.originalUrl);
    if (request.originalUrl == '/auth') {
        let body = [];
        request.on('error', (err) => {
            response.statusCode = 400;
            return response.end();
        }).on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            authorization.getAuthorization(store, body, 'en')
                .then((token) => {
                    log.debug('Authentification success');
                    return httpLib.sendAPIData(response, 200, {token: token});
                }).catch((error) => {
                    log.debug('Authentification fail');
                    return httpLib.sendAPIError(response, 401, error.message);
                });
        });
    } else {
        next();
    }
});

// Check access right of user on the ressource
app.use((request, response, next) => {
    aclLib.canAccess(request.method, request.url, request.user, request.language)
        .then(() => {
            next();
        }).catch((error) => {
            return httpLib.sendAPIError(response, error.code ? error.code : 500, error.message);
        });
});

// Error response for bad authorization
app.use((error, request, response, next) => {
    if (error.name === 'UnauthorizedError') {
        return httpLib.sendAPIError(response, 401, error.message);
    }
});

// Process authentificated API client request
app.use((request, response) => {
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
});

// Port server listen
app.listen(process.env.SERVER_PORT);
log.info('Server listening on port ' + process.env.SERVER_PORT);
