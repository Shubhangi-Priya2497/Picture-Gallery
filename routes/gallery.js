var express = require("express");
var router  = express.Router();
var multer  = require("multer");
var fs      = require("fs");
var path    = require('path');
var jwt     = require('jsonwebtoken')
var Gallery = require("../models/gallery");
var middleware = require("../middleware");
//var imageData = Gallery.find({});

router.use(express.static(__dirname+"./public/"));

// if (typeof localStorage === "undefined" || localStorage === null) {
//   const LocalStorage = require('node-localstorage').LocalStorage;
//   localStorage = new LocalStorage('./scratch');
// }

var Storage= multer.diskStorage({
    destination:"./public/uploads/",
    filename:(req,file,cb)=>{
      cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
    }
});

var upload = multer({
    storage:Storage
}).single('file');

//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Gallery.find({}, function(err, allGallery){
       if(err){
           console.log(err);
       } else {
          res.render("gallery/index",{gallery:allGallery});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    //var image = req.body.image.data;
    var image= req.file.filename;
    var success =req.file.filename+ " uploaded successfully";
    // imageDetails.save(function(err,doc){
    //     if(err) throw err;
    //     imageData.exec(function(err,data){
    //         if(err) throw err;
    //         res.render('upload-file', { title: 'Upload File', records:data,   success:success });
    //     });
    // });
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newGallery = {name: name,image: image, description: desc, author:author}
    // Create a new campground and save to DB
    Gallery.create(newGallery, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/gallery");
        }
    });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("gallery/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Gallery.findById(req.params.id).populate("comments").exec(function(err, foundGallery){
        if(err || !foundGallery){
            req.flash("error", "Gallery not found");
            res.redirect("back");
        } else {
            console.log(foundGallery)
            //render show template with that campground
            res.render("gallery/show", {gallery: foundGallery});
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkGalleryOwnership, function(req, res){
    Gallery.findById(req.params.id, function(err, foundGallery){
        res.render("gallery/edit", {gallery: foundGallery});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id",middleware.checkGalleryOwnership, function(req, res){
    // find and update the correct campground
    Gallery.findByIdAndUpdate(req.params.id, req.body.gallery, function(err, updatedGallery){
       if(err){
           res.redirect("/gallery");
       } else {
           //redirect somewhere(show page)
           res.redirect("/gallery/" + req.params.id);
       }
    });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id",middleware.checkGalleryOwnership, function(req, res){
   Gallery.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/gallery");
      } else {
          res.redirect("/gallery");
      }
   });
});

// app.use(multer({ dest: "./uploads/",
//     rename: function (fieldname, filename) {
//     return filename;
//     },
// }));


module.exports = router;
