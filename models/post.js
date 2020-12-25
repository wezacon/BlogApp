const { Schema, model } = require('mongoose');
const shortid = require('shortid');
const marked = require('marked');
const slugify = require('slugify');
const idKey = shortid.generate();
const createDomPurifier = require('dompurify');
const { JSDOM } = require('jsdom');
const dompurify = createDomPurifier(new JSDOM().window)


const post = Schema({
    id: {
        type: String,
        default: Date.now,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    markdown: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    html: {
        type: String,
        required: true
    },
    likes: Array,
    authorName: String,
    authorId: String
});

post.pre('validate', function(next) {

    if(this.title){
        this.slug = slugify(this.title, { lower: true, strict: true })
    }

    if(this.markdown){
        this.html = dompurify.sanitize(marked(this.markdown));
    }

    next()
});

module.exports = model('post', post);