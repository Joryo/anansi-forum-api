const aclLib = require('./acl.js');
const {message} = require('fortune');

/**
 * Model hook library
 */
class Hooks {
    /**
     * Check if logged Member can update or delete a record by checking author id
     * @param {object} loggedMember
     * @param {string} authorId
     * @param {string} badField
     */
    checkLoggedMemberCanUpdateOrDeleteRecord(loggedMember, authorId, badField) {
        if (!aclLib.isAdmin(loggedMember) && loggedMember.id != authorId) {
            throw new ForbiddenError(message('InvalidAuthorization', 'en', {field: badField}));
        }
    }
}

module.exports = new Hooks();
