var express = require('express');
var router = express.Router();

exports.index = function(req, res){
res.render('login', { title: 'ejs' });};
/* GET home page. */
router.get('/', ensureAuthenticated,function(req, res, next) {
  res.render('index', { title: 'Members' });
});

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/users/login');
}

module.exports = router;
