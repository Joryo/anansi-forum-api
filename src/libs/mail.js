'use strict';

let nodemailer = require('nodemailer');

let log = require('./log.js').logger;

/**
 * Mail library
 */
class Mailer {
    /**
     * Send an email
     * @param {string} to - Recipient
     * @param {string} subject - Mail subject
     * @param {string} text - Mail text (html)
     * @return {Promise}
     */
    send(to, subject, text) {
        return new Promise(function(resolve, reject) {
            let transporter = nodemailer.createTransport({
                service: process.env.MAILER_SERVICE,
                auth: {
                    user: process.env.MAILER_ADRESS,
                    pass: process.env.MAILER_PASSWORD,
                },
            });

            let mailOptions = {
                from: process.env.MAILER_ADRESS,
                to: to,
                subject: subject,
                html: text,
            };
            log.verbose('Send mail to ' + to + ': ' + subject);
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    reject(error);
                } else {
                    resolve(info.response);
                }
            });
        });
    }
}

module.exports = new Mailer();
