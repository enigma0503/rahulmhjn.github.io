var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './public/image'});

var passport = require('passport');
var LocalStrategy = require('passport-local');

var User = require('../models/user');
const multerConfig = {

storage: multer.diskStorage({
 //Setup where the user's file will go
 destination: function(req, file, next){
   next(null, './public/image');
   },

    //Then give the file a unique name
    filename: function(req, file, next){
        console.log(file,"rahulmmmmmmmmmmmmmmmmmmmM",req.body.name);

        const ext = file.mimetype.split('/')[1];
        next(null, req.body.name+ '.'+'jpeg');
      }
    }),

    //A means of ensuring only images are uploaded.
    fileFilter: function(req, file, next){
          if(!file){
            next();
          }
        const image = file.mimetype.startsWith('image/');
        if(image){
          console.log('photo uploaded');
          next(null, true);
        }else{
          console.log("file not supported");

          //TODO:  A better message response to user on failure.
          return next();
        }
    }
  };


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{title:'Register'});
});

router.get('/login', function(req, res, next) {
  res.render('login',{title:'Login'});
});

router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/login',failureFlash: 'Invalid username or password'}),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    req.flash('success','You are now logged in');
    res.redirect('/');
    console.log('You are now logged in');
  });
router.post('/upload',upload.single('paper'),function(req,res){
    if(req.file){
    	console.log('Uploading Research Paper...');
    	var paper = req.file.filename;
      var path = req.file.path;
    } else {
    	console.log('No Research Paper Uploaded...');
    }
});
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

 passport.use(new LocalStrategy(function(username, password, done){
    User.getUserByUsername(username,function(err,user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'Unknown User'});
      }

      User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        } else {
          return done(null, false, {message: 'Invalid Password'});
        }
      });
    });
  }));

router.post('/register', multer(multerConfig).single('profileimage') ,function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  if(req.file){
  	console.log('Uploading File...');
  	var profileimage = req.file.filename;
  } else {
  	console.log('No File Uploaded...');
  	var profileimage = 'noimage.jpg';
  }

  // Form Validator
  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('email','Email field is required').notEmpty();
  req.checkBody('email','Email is not valid').isEmail();
  req.checkBody('username','Username field is required').notEmpty();
  req.checkBody('password','Password field is required').notEmpty();
  req.checkBody('password2','Passwords do not match').equals(req.body.password);

  // Check errors
  var errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors: errors
    });
  } else{
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileimage
    });

    User.createUser(newUser,function(err,user){
      if(err) throw err;
      console.log(user);
    });

    req.flash('success','You are now registered and can now login');
    console.log("you are registered");

    res.location('/users/login');
    res.redirect('/users/login');
  }
});

router.get('/logout',function(req, res){
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
})

module.exports = router;
