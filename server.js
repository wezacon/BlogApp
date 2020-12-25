const express = require('express');
const app = express();
require('dotenv').config();
const { connect } = require('mongoose');
const bcrypt = require('bcrypt');
const shortid = require('shortid');
const userModel = require('./models/user');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const initializePassport = require('./passport-config');
const Autolinker = require('autolinker');
const path = require("path");
const isImageUrl = require('is-image-url');
const systemModel = require("./models/system");
const postModel = require('./models/post');

// KEEP SITE ALIVE
setInterval(
    () =>
      require("node-fetch")(process.env.SITELINK).then(() =>
        console.log("Pinged website....")
      ),
    4 * 60 * 1000
  );

var communityAmount = 3;


app.use(express.static("public"));
initializePassport(
    passport,
    email => user.email,
    id => user.id
)


async function connectSite(){
    await connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true
    }, (err) =>{
        if(err){
            new Error('[DATABASE]', err)
        } else {
            console.log('[DATABASE]', 'Connection success!')
        }
    }); 
    
    const system = await systemModel.findOne({ id: "system" });
    if(!system){    
        console.warn('[WARNING]', 'NO CONNNECTION WITH [SYSTEM] CREATING NEW SYSTEM...');
        const newSystem = new systemModel({ id: "system" });
        await newSystem.save();
        return console.info('[INFO]', 'NEW [SYSTEM] CREATED!');
    } else {
        return console.info('[INFO]', 'SYSTEM CONNECTION SUCCESS!')
    }
}

connectSite()

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// req.user == req.user.id (EX)
// ROUTERS
const postRouter = require('./routes/posts');
app.use('/post', postRouter)
const userRouter = require('./routes/user');
app.use('/u', userRouter)
// GETS
app.get('/', async (req, res) => {
    const system = await systemModel.findOne({ id: "system" });
    const posts = await postModel.find().sort({createdAt: 'desc'});
    let data = {
        pageName: "Posts",
        system,
        posts,
        user: req.user
    }

    res.render('index.ejs', data);

});

app.get('/login', checkNotAuth, async (req, res) => {
    const system = await systemModel.findOne({ id: "system" });
    let data = {
        pageName: "Login",
        system
    }

    res.render('login.ejs', data);

});

app.delete('/logout', (req, res) =>{
    req.logOut()
    res.redirect('/login');
})

app.get('/register', checkNotAuth, async (req, res) => {
    const system = await systemModel.findOne({ id: "system" });

    let data = {
        pageName: "Register",
        system
    }

    res.render('register.ejs', data);

});

app.post('/login', checkNotAuth, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.post('/register', checkNotAuth, async (req, res) => {
    try {
        const RandomId = Math.random().toString(36).substr(2, 9);
        const field = req.body;
        const hashedPassword = await bcrypt.hash(field.password, 10);

        function callError(){
            return res.render('error.ejs', { msg: "You did not fill out every field. <a href='/register'>Try again</a>." })
        }

        if(!field.name) return callError();
        if(!field.email) return callError();        
        if(!field.password) return callError();

        const findUser = await userModel.findOne({ email: field.email, id: RandomId });
        const idExists = await userModel.findOne({ id: RandomId });
        if(idExists) return res.render('error.ejs', { msg: "An unknown error occured!" });
        if(findUser){
            console.log('[USER ERROR]', 'User exists.');
            return res.redirect('/register');
        } else {
            const newUser = new userModel({ username: field.name, email: field.email, password: hashedPassword });
            await newUser.save();
            res.redirect('/login');
        }

    } catch (error) {
        res.redirect('/register');
    }
    const findall = await userModel.find();
    console.log(findall)
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


app.get('*', (req, res) => {
    res.render('error.ejs', { msg: "Page not found." })
})
app.listen(process.env.port);
console.log('[INFO]', 'App running on port: ' + process.env.port)