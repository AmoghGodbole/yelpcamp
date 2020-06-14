var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
//No need to do middleare/index.js
//The reason is that index.js is a special name which is automatically required(put in very basic terms)

//Index- Show all campgrounds
router.get("/", function(req, res){
    // Get all cammpgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"});
        }
    });    
});

router.post("/", middleware.isLoggedIn, function(req,res){
    var name = req.body.name;
    var price = req.body.price
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, image: image, description: desc, author: author, price: price}
    //Create a new campground and save to db
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/campgrounds");
        }
    })
});

//New Route
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//Show Route
router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found!");
            res.redirect("back");
            console.log(err);
        } 
        else{
            // console.log(foundCampground);
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//Edit Campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        //You can add in another flash message here, to handle the err
        res.render("campgrounds/edit", {campground: foundCampground});
    });         
});

//Update Campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
    //Find and Update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        }else{
            //Redirect(mostly to the show page to view what you have edited)
            res.redirect("/campgrounds/" + req.params.id);  //updatedCampground._id will also work of course
        }
    });
});

//Destroy campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        }else{
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;