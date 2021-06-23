//Load modules
const express=require('express');
const exphbs=require('express-handlebars');
//initialize application
const app=express();
const session = require("express-session");
    const bodyParser = require("body-parser");
    const cookieParser=require('cookie-parser');
    const passport=require('passport');
    const User=require('./models/user');
    const Post=require('./models/post');
    const methodOverride=require('method-override');
    //helper
    const{
      ensureAuthentication, ensureGuest
    }=require('./helpers/auth');
//Express config
app.use(cookieParser());
//Link passport to server
require('./passport/google-passport');
require('./passport/facebook-passport');
app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(session({ secret: 'keyboard cat',
resave:true,saveUninitialized:true }));
app.use(methodOverride('_method'));
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
app.get('/',ensureGuest,(req,res)=>{
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
  passport.authenticate('facebook',{
    scope:'email'
  }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res)=> {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });
  //ROUTE to mail form
  app.post('/addemail',(req,res)=>{
    const email=req.body.email;
    User.findById({_id: req.user._id})
    .then((user)=>{
      user.email=email;
      user.save()
      .then(()=>{
        res.redirect('/profile');
      });
    });
  });
  //HANDLE ROUTE for all users
  app.get('/users',ensureAuthentication,(req,res)=>{
    User.find({}).then((users)=>{
      res.render('users',{
        users:users
      });
    });
  });
  //ROUTE to phone form
  app.post('/addphone',(req,res)=>{
    const phone=req.body.phone;
    User.findById({_id: req.user._id})
    .then((user)=>{
      user.phone=phone;
      user.save()
      .then(()=>{
        res.redirect('/profile');
      });
    });
  });
  //ROUTE to show individual user profile
  app.get('/user/:id',(req,res)=>{
    User.findById({_id: req.params.id})
    .then((user)=>{
      res.render('user',{
        user:user
      });
    });
  });
  //ROUTE to location form
  app.post('/addlocation',(req,res)=>{
    const location=req.body.location;
    User.findById({_id: req.user._id})
    .then((user)=>{
      user.location=location;
      user.save()
      .then(()=>{
        res.redirect('/profile');
      });
    });
  });
  //Handling get post route
  app.get('/addPost',(req,res)=>{
    res.render('addPost');
  });
//handling post route
app.post('/savePost',(req,res)=>{
  var allowComments;
  if(req.body.allowComments){
    allowComments=true;
  }
  else{
    allowComments=false;
  }
  const newPost={
    title:req.body.title,
    body:req.body.body,
    status:req.body.status,
    allowComments:allowComments,
    user:req.user._id
  }
  new Post(newPost).save()
  .then(()=>{
    res.redirect('posts');
  });
});
//Handling edit  route
app.get('/editpost/:id',(req,res)=>{
  Post.findOne({_id:req.params.id})
  .then((post)=>{
    res.render('editingPost',{
      post:post
    });
  });
});
app.put('/editingPost/:id',(req,res)=>{
  Post.findOne({_id:req.params.id})
  .then((post)=>{
    var allowComments;
    if(req.body.allowComments){
      allowComments=true;
    }
    else{
      allowComments=false;
    }
    post.title=req.body.title;
    post.body=req.body.body;
    post.status=req.body.status;
    post.allowComments=allowComments;
    post.save()
    .then(()=>{
      res.redirect('/profile');
    });
  });
});
//save comment in database
app.post('/addComment/:id',(req,res)=>{
  Post.findOne({_id: req.params.id})
  .then((post)=>{
    const newComment={
      commentBody:req.body.commentBody,
      commentUser:req.user._id
    }
    post.comments.push(newComment)
    post.save()
    .then(()=>{
      res.redirect('/posts')
    });
  });
});
//Handling delete route
app.delete('/:id',(req,res)=>{
  Post.remove({_id:req.params.id})
  .then(()=>{
    res.redirect('profile');
  });
});
app.get('/posts',ensureAuthentication,(req,res)=>{
  Post.find({status:'public'})
  .populate('user')
  .populate('comments.commentUser')
  .sort({date:'desc'})
  .then((posts)=>{
    res.render('publicPosts',{
      posts:posts
    });
  });
});
//display single users all public posts
app.get('/showposts/:id',(req,res)=>{
  Post.find({user:req.params.id,status: 'public'})
  .populate('user')
  .sort({date:'desc'})
  .then((posts)=>{
    res.render('showPosts',{
      posts:posts
    });
  });
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
app.get('/profile',ensureAuthentication,(req,res)=>{
  Post.find({user:req.user._id})
  .populate('user')
  .sort({date:'desc'})
  .then((posts)=>{
    res.render('profile',{
      posts:posts
    });
  });
});
app.listen(port,()=>{
    console.log('Server is running ')
})