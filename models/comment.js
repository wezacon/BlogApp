const { Schema, model } = require('mongoose');
const shortid = require('shortid');

const idKey = shortid.generate();


const comment = Schema({
    id: {
        type: String,
        default: Date.now
    },
    post: String,
    username: String,
    comment: String
});

module.exports = model('comment', comment);