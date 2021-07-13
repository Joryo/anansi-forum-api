let pjson = require('../../package.json');

/**
 * Server status model
 */
class Status {
    /**
     * Get server status
     * @param {Object} database - Database connection
     * @return {Promise} status
     */
    get(database) {
        return new Promise((resolve, reject) => {
            let db = database.getConnection();
            if (!db) {
                reject({message: 'database not initialized'});
            }
            const today = new Date();
            const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate()-7);

            Promise.all([
                db.collection('member').count(),
                db.collection('post').count(),
                db.collection('comment').count(),
                db.collection('member').count({'dateCreated': {'$gt': lastWeek}}),
                db.collection('post').count({'dateCreated': {'$gt': lastWeek}}),
                db.collection('comment').count({'dateCreated': {'$gt': lastWeek}}),
            ]).then((results) => {
                resolve({
                    'overall': {
                        'members': results[0],
                        'posts': results[1],
                        'comments': results[2],
                    },
                    'lastWeek': {
                        'members': results[3],
                        'posts': results[4],
                        'comments': results[5],
                    },
                    'version': pjson.version,
                });
            }).catch(() => {
                reject({message: 'status requests fails'});
            });
        });
    }
}

module.exports = new Status();
