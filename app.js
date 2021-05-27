//Load modules
const express=require('express');
const exphbs=require('express-handlebars');
//initialize application
const app=express();
const session = require("express-session");
    const bodyParser = require("body-parser");
    const cookieParser=require('cookie-parser');
    const passport=require('passport');
    const User=require('./models/user')
//Express config
app.use(cookieParser());
//Link passport to server
require('./passport/google-passport');
require('./passport/facebook-passport');
app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(session({ secret: 'keyboard cat',
resave:true,saveUninitialized:true }));
  app.use(passport.initialize());
  app.use(passport.session());
  //setting user as global variable
  app.use((req,res,next)=>{
    res.locals.user=req.user||null;
    next();
  })
//connected to MongoURI exported from external file
const keys=require('./config/keys')
const mongoose=require('mongoose')
//setup template engine
app.engine('handlebars',exphbs({
    defaultLayout:false}));

app.set('view engine','handlebars');
const path=require('path');
//setup static folder to serve css,js,images
app.use(express.static('public'));
app.set('views',path.join(__dirname,'/views'));
//handle routing
app.get('/',(req,res)=>{
    res.render('main');
});
app.get('/about',(req,res)=>{
    res.render('about')
});
//logout routing
app.get('/logout',(req,res)=>{
  req.logOut();
  res.redirect('/');
})
//Google auth route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res)=> {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });
  //Facebook auth route
  app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res)=> {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });
//connect to remote database
mongoose.Promise=global.Promise;
mongoose.connect(keys.MongoURI,{
    useNewUrlParser:true
})

.then(()=>{
    console.log('Connected to remote database')
});
const port=process.env.PORT||3000;
app.get('/profile',(req,res)=>{
  User.findById({_id:req.user._id})
  .then((user)=>{
    res.render('profile',{
      user:user
    })
  })
});
app.listen(port,()=>{
    console.log('Server is running ')
})