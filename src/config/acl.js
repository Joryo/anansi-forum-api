/**
 * Access controle list
 */
module.exports = {
    /**
    * The superAdmins can perform any request on the API
    * @type {String}
    */
    superAdmins: [
        process.env.SUPER_ADMIN,
    ],
    /**
    * Roles list
    * @type {Object}
    */
    roles: {
        guest: 0,
        registered: 1,
        admin: 2,
    },
    /**
    * API Routes access controle list
    * @type {Object}
    */
    authorizations: {
        members: {
            post: 'guest',
            get: 'registered',
            delete: 'registered',
            patch: 'registered',
        },
        posts: {
            post: 'registered',
            get: 'registered',
            delete: 'registered',
            patch: 'registered',
        },
        tags: {
            post: 'admin',
            get: 'registered',
            delete: 'admin',
            patch: 'admin',
        },
        comments: {
            post: 'registered',
            get: 'registered',
            delete: 'registered',
            patch: 'registered',
        },
        status: {
            get: 'admin',
        },
    },
};
