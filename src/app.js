'use strict';

require('dotenv').config();

let cors = require('cors');
let express = require('express');
let database = require('./libs/database.js');
let log = require('./libs/log.js').logger;

/**
 * Middlewares
 */
const jsonwebtokenMiddleware = require('./middlewares/jsonwebtoken');
const languagesMiddleware = require('./middlewares/languages');
const requestlogMiddleware = require('./middlewares/requestlog');
const aclMiddleware = require('./middlewares/acl');
const listenerMiddleware = require('./middlewares/listener');
const badauthMiddleware = require('./middlewares/badauth');

/**
 * Custom routes
 */
const authRoute = require('./routes/auth');
const lostPasswordRoute = require('./routes/lostpassword');
const statusRoute = require('./routes/status');

database.init(process.env.DB_HOST, process.env.DB_DATABASE);

let app = express();

app.use(cors()); // Cross domain authorization
app.use(languagesMiddleware);
app.use(requestlogMiddleware);

/**
 * Not logged routes
 */
app.post('/auth', authRoute);
app.post('/lostPassword', lostPasswordRoute);

/**
 * Logged routes
 */
app.use(jsonwebtokenMiddleware);
app.use(aclMiddleware);
app.use(badauthMiddleware);

app.get('/status', statusRoute);
app.use(listenerMiddleware);

/**
 * Start server
 */
app.listen(process.env.SERVER_PORT);
log.info('Server listening on port ' + process.env.SERVER_PORT);
