let jwt = require('express-jwt');

module.exports = jwt({secret: process.env.JWT_SECRET})
    .unless({path: ['/auth', {url: '/members', methods: ['POST']}]});
