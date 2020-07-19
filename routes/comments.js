var express = require("express");
var router  = express.Router({mergeParams: true});
var Gallery = require("../models/gallery");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new",middleware.isLoggedIn, function(req, res){
    // find campground by id
    console.log(req.params.id);
    Gallery.findById(req.params.id, function(err, gallery){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {gallery: gallery});
        }
    })
});

//Comments Create
router.post("/",middleware.isLoggedIn,function(req, res){
   //lookup campground using ID
   Gallery.findById(req.params.id, function(err, gallery){
       if(err){
           console.log(err);
           res.redirect("/gallery");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               req.flash("error", "Something went wrong");
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               gallery.comments.push(comment._id);
               gallery.save();
               console.log(comment);
               req.flash("success", "Successfully added comment");
               res.redirect('/gallery/' + gallery._id);
           }
        });
       }
   });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Gallery.findById(req.params.id, function(err, foundGallery) {
        if(err || !foundGallery) {
            req.flash("error", "No gallery found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
                res.render("comments/edit", {gallery_id: req.params.id, comment: foundComment});
            }
        });
    });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/gallery/" + req.params.id );
      }
   });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
           req.flash("success", "Comment deleted");
           res.redirect("/gallery/" + req.params.id);
       }
    });
});

module.exports = router;