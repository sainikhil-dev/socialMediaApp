//Load modules
const express=require('express');
const exphbs=require('express-handlebars');
//initialize application
const app=express();
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
})
//connect to remote database
mongoose.connect(keys.MongoURI)
.then(()=>{
    console.log('Connected to remote database')
});
const port=process.env.PORT||3000;
app.listen(port,()=>{
    console.log('Server is running ')
})