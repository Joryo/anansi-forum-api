'use strict';

let recordTypes = require('../models/recordTypes.js');
let searchConfig = require('../config/search.js');
let log = require('./log.js');

/**
 * Indexes library
 */
class Indexes {
    /**
     * Init the unique index and search indexes on the database
     * @param {Object} db - Databse connection
     * return {Promise}
     */
    init(db) {
        Indexes.prototype.createSearchIndexes(db);
        Indexes.prototype.createUniqueIndexes(db);
    }
    /**
     * Create the search indexes on the database
     * @param {Object} db - Databse connection
     */
    createSearchIndexes(db) {
        if (searchConfig) {
            for (let record in searchConfig) {
                if (searchConfig[record]) {
                    for (let attribute in searchConfig[record]) {
                        if (attribute) {
                            const collection = db.collection(record);
                            collection.createIndex({[attribute]: 'text'}, (err) => {
                                if (err) {
                                    log.error('Fail to create search indexes');
                                    throw new Error('Unable to create search indexes for ' + attribute);
                                }
                            });
                        }
                    }
                }
            }
        }
    }
    /**
     * Create the unique indexes on the database
     * @param {Object} db - Databse connection
     */
    createUniqueIndexes(db) {
        if (recordTypes) {
            for (let record in recordTypes) {
                if (recordTypes[record]) {
                    for (let attribute in recordTypes[record]) {
                        if (recordTypes[record][attribute].isUnique) {
                            const collection = db.collection(record);
                            collection.createIndex({[attribute]: 1}, {unique: true}, (err) => {
                                if (err) {
                                    log.error('Fail to unique indexes');
                                    if (err.code === 11000) {
                                        throw new Error('Unable to create unique indexes for '
                                        + attribute + ' (duplicate)');
                                    }
                                    throw new Error('Unable to create unique indexes for ' + attribute);
                                }
                            });
                        }
                    }
                }
            }
        }
    }
}

module.exports = new Indexes();
