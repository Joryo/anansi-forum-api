'use strict';

let MongoClient = require('mongodb').MongoClient;

/**
 * Database library
 */
class Database {
    /**
     * Connect the database
     * @param {String} host
     * @param {String} database
     * @return {Promise} database client
     */
    connect(host, database) {
        let self = this;
        return new Promise((resolve, reject) => {
            MongoClient.connect(host, {useNewUrlParser: true}, (err, client) => {
                if (err) {
                    reject('Connection to MongoDB fail: ' + host);
                } else {
                    self.client = client.db(database);
                    resolve(self.client);
                }
            });
        });
    }

    /**
     * Get the database client
     * @return {Object} database client
     */
    getConnection() {
        return this.client;
    }
}

module.exports = new Database();
