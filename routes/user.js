const express = require('express');
const router = express.Router();
const postModel = require('../models/post');
const userModel = require('../models/user');
router.get('/', (req, res) => {
    return res.redirect('/');
})

// x.createdAt.toLocaleDateString() = xx/xx/xxxx

router.get('/:id', checkAuth, async (req, res) => {
    const user = await userModel.findOne({ id: req.params.id });
    if(!user) return res.redirect('/');
    const userPosts = await postModel.find({ authorId: user.id }).sort({ createdAt: 'desc' });
    let data = {
        user,
        client: req.user,
        userPosts
    }
    return res.render('u/view.ejs', data);
});


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