//jshint esversion:6
//below three are dependencies
require('dotenv').config() //environment variable placed topmost so that able to configure it
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const e = require("express");
const md5 = require("md5");
// const encrypt = require("mongoose-encryption"); removed to do md5 encryption

const app = express();

console.log(process.env.API_KEY); // gets access to contents of .env file printed on terminal
console.log(md5("123")); //hash applied to string 123

app.use(express.static("public")); //adding public folder as static resource
app.set('view engine' , 'ejs');    //setting view engine as ejs
app.use(bodyParser.urlencoded({ //set up body - parser
    extended:true
}));

//in order to put mongoose to action we have to connect it
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true,useUnifiedTopology:true});
//userDB i s the database which will be created port 27017 is default server of mongodb

////////////////////////////SETUP OUR NEW USER DATABASE///////////////////////////////

const userSchema = new mongoose.Schema({
    email:String,
    password:String
});
 //key used by us to encrypt our passwords
// userSchema.plugin(encrypt, { secret: process.env.SECRET ,encryptedFields: ['password']});
//removed for md5 encryption

//inorder to encrypt multiple things like password add other fileds int o the array 
//by using commas ,
//encrypt plugin added .It is added before code of line 30
const User = new mongoose.model("User",userSchema); //make model from schema


app.get("/",function(req,res){
    res.render("home"); //it renders that specific file i.e. home.ejs
});

app.get("/login",function(req,res){
    res.render("login");    //it renders that specific file i.e. login.ejs
});

app.get("/register",function(req,res){
    res.render("register");   //it renders that specific file i.e. register.ejs
});

app.post("/register",function(req,res){
    //if user(newUser) has been successfully created into our userDB 
    //then they are rendered to secrets page
    const newUser = new User({
        email:req.body.username,
        password:md5(req.body.password)   //hash applied to the password
        // these values taken from register.ejs file
    });
    newUser.save(function(err){
        //mongoose encrypts the password when you do perform save function
        if(err){console.log(err); }
        else{ res.render("secrets"); }   //rendered to secrets page
    });
});

app.post("/login",function(req,res){
    const username = req.body.username;      
    const password = md5(req.body.password);      //apply hash function to password

    //the above two details has been entered by the user in login page
    User.findOne({email:username},function(err,foundUser){
        //mongoose decrypts when you do find function
        //foundUser.username and foundUser.password are the information stored in our database
        //we need to match both entries by comparing
        if(err){console.log(err); }
        else{
            if(foundUser){
                if(foundUser.password === password){
                    //means correct users 
                    res.render("secrets"); //render secrets page to them i.e secrets.ejs file
                }
            }
        }
    });
});


app.listen(3000, function(){
    console.log("Server started on port 3000.");
}); //set up server to listen at port 3000