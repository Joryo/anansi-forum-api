let winston = require('winston');
let colors = require('colors');

/**
 * Log library
 */
class Log {
    /**
     * Init the logger
     */
    constructor() {
        let devLogFormat = winston.format.printf((info) => {
            let toColor = info.timestamp + ' [' + info.level + ']';
            switch (info.level) {
                case 'info':
                    toColor = colors.bgCyan(toColor);
                    break;
                case 'error':
                    toColor = colors.bgRed(toColor);
                case 'warn':
                    toColor = colors.bgYellow(colors.black(toColor));
                case 'debug':
                    toColor = colors.bgMagenta(colors.white(toColor));
                case 'verbose':
                    toColor = colors.bgBlack(colors.white(toColor));
            }
            return toColor + ': ' + info.message;
        });

        let transports = [];
        if (process.env.NODE_ENV !== 'test') {
            transports = [
                new winston.transports.File({filename: process.env.ERROR_LOG_FILE, level: 'error'}),
                new winston.transports.File({filename: process.env.COMBINED_LOG_FILE}),
            ];
        }

        let logger = winston.createLogger({
            level: process.env.NODE_ENV !== 'test' ? process.env.LOG_LEVEL : 'error',
            format: winston.format.json(),
            transports: transports,
        });
        if (process.env.NODE_ENV !== 'production') {
            logger.add(new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.timestamp(),
                    devLogFormat
                ),
            }));
        }
        this.logger = logger;
    }
}

module.exports = new Log();
