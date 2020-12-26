const express = require('express');
const router = express.Router();
const post = require('../models/post');
const commentModel = require('../models/comment');
router.get('/', (req, res) => {
    return res.redirect('/')
})

router.post('/', checkAuth, async (req, res) =>{
    const field = req.body;
    if(!field.title) return res.render('error.ejs', { msg: "No title specified" });
    if(!field.markdown) return res.render('error.ejs', { msg: "Please add some markdown content!" });

    const exists = await post.findOne({ title: field.title });
    if(exists) return res.render('error.ejs', { msg: "Posts can't have the same title!" })

    let postn = new post({
        title: field.title,
        description: field.description,
        markdown: field.markdown,
        authorName: req.user.username,
        authorId: req.user.id
    })
    try {
        postn = await postn.save();    
        console.log(postn)
        return res.redirect(`/post/${postn.slug}`);    
    } catch (e) {
        console.log('[ERROR]', e)
        return res.render('post/new', { post: post });
    }
})


router.post('/:id/c/new', checkAuth, async (req, res) => {

    const postm = await post.findOne({ id: req.params.id });
    if(!postm) return res.redirect(`/`);

    if(!req.body.comment) return res.redirect('/');

    const execute = new commentModel({ post: req.params.id, username: req.user.username, comment: req.body.comment });
    await execute.save();

    return res.redirect(`/post/${postm.slug}`);
});


router.post('/:id/like', checkAuth, async (req, res) => {

    const postm = await post.findOne({ id: req.params.id });
    if(!postm) return res.redirect('/');

    if(postm.likes.includes(req.user.id)){
        var state = 'unlike';
    } else {
        var state = 'like';
    }

    if(state == 'like'){
        const execute = await post.findOneAndUpdate({ id: req.params.id }, { $push: { likes: req.user.id } });
        return res.redirect('/post/' + postm.slug)
    } else {
        const execute = await post.findOneAndUpdate({ id: req.params.id }, { $pull: { likes: req.user.id } });
        return res.redirect('/post/' + postm.slug)
    }

});

router.get('/new', checkAuth, (req, res) => {
    console.log('[INFO]', 'NEW POST PAGE ACCESS GRANTED')
    let data = {
        pageName: "New Post",
        post: new post()
    }

    res.render('post/new.ejs', data);
})


router.get('/edit/:id', checkAuth, async (req, res) => {
    const postOb = await post.findOne({ id: req.params.id });
    if(!postOb) return res.redirect('/');
    if(postOb.authorId !== req.user.id) return res.redirect('/');
    console.log('[INFO]', 'NEW POST PAGE ACCESS GRANTED')
    let data = {
        pageName: "Edit Post",
        post: postOb
    }

    res.render('post/edit.ejs', data);
})

router.put('/:id', checkAuth, async (req, res) => {
    const field = req.body;
    if(!field.title) return res.render('error.ejs', { msg: "No title specified" });
    if(!field.markdown) return res.render('error.ejs', { msg: "Please add some markdown content!" });
    console.log('[INFO]', 'USER CONFIRMED EDIT')
    let postOb = await post.findOne({ id: req.params.id });
    if(!postOb) return res.redirect('/');
    if(postOb.authorId !== req.user.id) return res.redirect('/');
    postOb.title = field.title
    postOb.description = field.description
    postOb.markdown = field.markdown
    postOb.save();
    return res.redirect('/post/' + postOb.slug);
})

router.post('/del/:id', checkAuth, async (req, res) => {
    const postDb = await post.findOne({ id: req.params.id });
    if(!postDb) return res.redirect('/');
    if(postDb.authorId !== req.user.id) return res.redirect('/');
    await post.findOneAndDelete({ id: req.params.id });
    return res.redirect('/');
});

router.get('/:slug', async (req, res) => {
    const postObject = await post.findOne({ slug: req.params.slug });
    if(postObject == null) return res.render('error.ejs', { msg: "Post not found!" })
    const comments = await commentModel.find({ post: postObject.id }).sort({ $natural:-1 });
    let data = {
        user: req.user,
        post: postObject,
        comments
    }
    return res.render(`post/show.ejs`, data)
})


async function checkAuth(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect('/login');
}

async function checkNotAuth(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    next();
}

module.exports = router