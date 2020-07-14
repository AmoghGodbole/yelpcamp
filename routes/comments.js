const express = require("express");
const router = express.Router({mergeParams: true});
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware");

//========================
//  Comments Route
//========================
router.get("/new", middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if(err || !campground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            res.render("comments/new", {campground: campground});            
        }
    });
});

//Comments create route
router.post("/", middleware.isLoggedIn, (req,res) => {
    Campground.findById(req.params.id, (err,campground) => {
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            Comment.create(req.body.comment, (err, comment) => {
                if(err){
                    req.flash("error", "Something went wrong");  //Probably will never be hit
                    console.log(err);
                }else{
                    //Add username and ID to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //We can count on req.user not being undefined
                    //This is because we can add a comment only when we are logged in 
                    //Save the comment 
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Succcesfully added comment!");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

//Edit Route for comments
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err || !foundCampground){
            req.flash("error", "Campground not found!");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if(err){
                res.redirect("back");
            }else{
                res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
            }
        });
    });
});

//Update route for comments
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/" + req.params.id);  
        }
    });
});

//Destroy route for comments
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if(err){
            res.redirect("back");
        }else{
            req.flash("success", "Comment deleted successfully!")
            res.redirect("/campgrounds/" + req.params.id);      
            //Go back to the campground, which makes sense
        }
    });
});

module.exports = router;