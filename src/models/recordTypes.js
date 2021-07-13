module.exports = {
    /**
    * Forum member
    * @type {Object}
    */
    member: {
        // Attributs
        email: {type: String, isUnique: true},
        password: String,
        pseudo: String,
        role: String,
        dateCreated: Date,
        // Relations
        posts: [Array('post'), 'author'],
        comments: [Array('comment'), 'author'],
    },
    /**
    * Member post
    * @type {Object}
    */
    post: {
        // Attributs
        title: String,
        text: String,
        dateCreated: Date,
        dateUpdated: Date,
        // Relations
        author: ['member', 'posts'],
        comments: [Array('comment'), 'post'],
        tags: [Array('tag'), 'posts'],
    },
    /**
    * Describe post
    * @type {Object}
    */
    tag: {
        // Attributs
        text: {type: String, isUnique: true},
        // Relations
        posts: [Array('post'), 'tags'],
        color: {type: String},
    },
    /**
    * Member comment on post
    * @type {Object}
    */
    comment: {
        // Attributs
        text: String,
        dateCreated: Date,
        // Relations
        author: ['member', 'comments'],
        post: ['post', 'comments'],
    },
};
