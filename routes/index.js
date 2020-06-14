var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

router.get("/", function(req, res){
    res.render("landing");
});

//------------
//Auth Routes
//------------

//Show the register form
router.get("/register", function(req, res){
    res.render("register", {page: "register"});
});

//Sign Up Logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Yelpcamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

//Show Login Form
router.get("/login", function(req, res){
    res.render("login", {page: "login"});
});

//Handling Login Logic 
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
    }), function(req, res){
});

//LogOut route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});

module.exports = router;