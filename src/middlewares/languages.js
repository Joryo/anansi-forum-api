let requestLanguage = require('express-request-language');

module.exports = requestLanguage({
    languages: ['en', 'fr', 'en-US', 'fr-FR']
});
