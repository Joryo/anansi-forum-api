let MongoClient = require('mongodb').MongoClient;
let indexes = require('../libs/indexes.js');
let log = require('../libs/log.js').logger;
/**
 * Database library
 */
class Database {
  /**
   * Get the database client
   * @return {Object} database client
   */
  getConnection() {
    return this.client;
  }

  /**
   * Init database connection
   * @param {string} host Host url
   * @param {string} name Database name
   */
  init(host, name) {
    MongoClient.connect(host, { useNewUrlParser: true }, (error, client) => {
      if (error) {
        log.error('Connection to MongoDB fail: ' + host);
        log.error(error);
      } else {
        log.info('Connection to MongoDB success: ' + host);

        this.client = client.db(name);
        indexes.init(this.client);
      }
    });
  }
}

module.exports = new Database();
