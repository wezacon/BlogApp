const { Schema, model } = require('mongoose');
const shortid = require('shortid');

const idKey = shortid.generate();


const User = Schema({
    id: {
        type: String,
        default: idKey
    },
    username: String,
    email: String,
    password: String,
    joinedAt: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        default: "member"
    },
    verified: {
        type: Boolean,
        default: false
    },
    supporter: {
        type: Boolean,
        default: false
    },
    imageUrl: {
        type: String,
        default: 'https://cdn.onlinewebfonts.com/svg/img_184513.png'
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

module.exports = model('User', User);