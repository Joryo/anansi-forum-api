let jwt = require('express-jwt');

module.exports = jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']})
    .unless({
        path: ['/auth', {url: '/members', methods: ['POST']}],
        useOriginalUrl: false,
    });
