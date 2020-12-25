const { Schema, model } = require('mongoose');
const shortid = require('shortid');

const idKey = 'system';


const system = Schema({
    id: {
        type: String,
        default: idKey
    },
    maintenance: { 
        type: Boolean,
        default: false
    }
});

module.exports = model('system', system);