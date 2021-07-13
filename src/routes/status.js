'use strict';

let log = require('../libs/log.js').logger;
let httpLib = require('../libs/http.js');
let database = require('../libs/database.js');
let status = require('../models/status.js');

module.exports = (_, response) => {
    status.get(database)
        .then((result) => {
            return httpLib.sendAPIData(response, 200, {status: result});
        }).catch((error) => {
            log.warn('Get status fail');
            return httpLib.sendAPIError(response, 500, error.message);
        });
}