let shortid = require('shortid');
let fortune = require('fortune');
let mongodbAdapter = require('fortune-mongodb');
let recordTypes = require('../models/recordTypes.js');
let memberHook = require('../models/hooks/member.js');
let postHook = require('../models/hooks/post.js');
let commentHook = require('../models/hooks/comment.js');
let tagHook = require('../models/hooks/tag.js');

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

let adapter = [
    mongodbAdapter, {
        url: process.env.DB_HOST + '/' + process.env.DB_DATABASE,
        generateId: () => shortid.generate(),
        useNewUrlParser: true,
    },
];

let hooks = {
    member: [memberHook.input, memberHook.output],
    post: [postHook.input, postHook.output],
    comment: [commentHook.input, commentHook.output],
    tag: [tagHook.input, tagHook.output],
};

module.exports = fortune(recordTypes, {hooks, adapter});
