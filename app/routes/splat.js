"use strict";

var mongoose = require('mongoose'); // MongoDB integration
var config = require("../config");
var path = require("path");
// var fs = require("fs");

// Connect to database, using credentials specified in your config module
mongoose.connect('mongodb://' +config.dbuser+ ':' +config.dbpass+
                '@ds053164.mongolab.com:53164/' + config.dbname);

// Schemas
var MovieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    director: { type: String, required: true },
    // ADD CODE for other Movie attributes
    // _id identity
    released: {type: Number, required: true},
    starring: {type: [String], required: true },
    rating: {type: String, required:true },
    duration: {type: Number, required: true},
    genre: {type: [String], required: true},
    synopsis: {type: String, required: true},
    freshTotal: {type: Number, required: true},
    freshVotes:  {type: Number, required: true},
    trailer: {type: String},
    poster: {type: String, required: true},
    dated: {type: Date, required: true}
});

var ReviewSchema = new mongoose.Schema({
    freshness: {type: Number, required: true},
    reviewText: {type: String, required: true},
    reviewName: {type: String, required: true},
    reviewAffil: {type: String, required: true},
    movieId: {type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}
});

// Constraints
// each title:director pair must be unique; duplicates are dropped
MovieSchema.index({title: 1});  // ADD CODE
// ReviewSchema.index()

// Models
var MovieModel = mongoose.model('Movie', MovieSchema);
var ReviewModel = mongoose.model('Review', ReviewSchema);

var fs = require('fs'),
    // path is "../" since splat.js is in routes/ sub-dir
    config = require(__dirname + '/../config'),  // port#, other params
    express = require("express"),
    url = require("url");

// Implemention of splat API handlers:

// "exports" is used to make the associated name visible
// to modules that "require" this file (in particular app.js)

// heartbeat response for server API
exports.api = function(req, res){

  res.status(200).send('<h3>Splat API is running!</h3>');
};

// retrieve an individual movie model, using it's id as a DB key
exports.getMovie = function(req, res){
    MovieModel.findById(req.params.id, function(err, movie) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve movie at this time ("
                +err.message+ ")" );
        } else if (!movie) {
            res.status(404).send("Sorry, that movie doesn't exist; try reselecting from Browse view");
        } else {
            res.status(200).send(movie);
        }
    });
};

exports.getMovies = function(req, res) {
    MovieModel.find(function(err, movie) {
        if (err) {
            res.status(500).send("Sorry, unable to retrive movies at this time" + err.message);
        }
        movie.forEach(function(item) {
            console.log("Received a GET request for _id: " + item._id);
        })
        res.send(movie);
    });
}

exports.addMovie = function(req, res) {
    var movie = new MovieModel(req.body);
    movie.save(function(err, doc) {
        if (err) {
            console.log(err.message);
            res.status(500).send(err.message);
        }
        else {
            console.log("Saved");
            res.send(doc);
        }
    });
}

exports.editMovie = function(req, res) {
    var id = req.body._id;
    console.log(req.body);
    delete req.body._id;
    MovieModel.findByIdAndUpdate(id, { $set: req.body}, function(err, movie) {
        if (err) {
            console.log(err.message);
            res.status(500).send(err.message);
        }
        else {
            console.log("successfully saved");
            res.send(movie);
        }
    });
}

exports.deleteMovie = function(req, res) {
    ReviewModel.remove({movieId: req.params.id}, function(err, movie) {
        if (err) {
            console.log(err.message);
        }
    });

    MovieModel.remove({_id: req.params.id}, function(err, movie) {
        if (err) {
            console.log(err.message);
            res.status(500).send(err.message);
        }
        else {
            res.send({_id: req.params.id});
        }
    });
}

exports.getReviews = function(req, res) {
    ReviewModel.find(function(err, review) {
        if (err) {
            res.status(500).send("Sorry, unable to retrive reviews at this time" + err.message);
        }
        review.forEach(function(item) {
            console.log("Received a GET request for _id: " + item._id);
        })
        res.send(review);
    });
}

exports.addReview = function(req, res) {
    var freshness;
    var id = req.params.id;
    console.log(req.body);
    console.log(req.body.rating);
    if (req.body.rating === 'fresh') {
        freshness = 1.0;
        console.log(freshness);
    }
    else {
        freshness = 0.0;
    }

    delete req.body.rating;
    req.body.freshness = freshness;
    req.body.movieId = req.params.id;


    MovieModel.findByIdAndUpdate(id, { $inc: {freshTotal: 1, freshVotes: freshness}}, function(err, movie) {
        console.log(req.body.rating);
        if (err) {
            console.log(err.message);
            // res.status(500).send(err.message);
        }
        else {
            console.log("successfully saved");
            // res.send(movie);
        }
    });

    var review = new ReviewModel(req.body);
    review.save(function(err, entry) {
        if (err) {
            console.log(err.message);
            res.status(500).send(err.message);
        }
        else {
            console.log("Saved");
            res.send(entry);
        }
    });
}

exports.playMovie = function(req, res) {
    console.log("got something");
    console.log(__dirname);
    // compute absolute file-system video path from __dirname and URL with id
    var file = path.resolve(__dirname,"../public/videos/" + req.params.id + ".ogx");// ADD CODE IM NOT SURE ABOUT THIS ALI
    console.log(file);
    // console.log(req.params.id);
    // get HTTP request "range" header, and parse it to get starting byte position
    var range = req.headers.range; // ADD CODE to access range header
    var positions = range.replace(/bytes=/, "").split("-"); //ADD CODE TO GET POSITIONS
    var start = parseInt(positions[0], 10); // ADD CODE to compute starting byte position

    // get a file-stats object for the requested video file, including its size
    fs.stat(file, function(err, stats) {
        // set end position from range header or default to video file size
        var total = stats.size;
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1; // ADD CODE
        var chunksize = (end-start)+1; // set chunksize to be the difference between end and start values +1

      	// send HTTP "partial-content" status (206) together with
        // HTML5-compatible response-headers describing video being sent
      	res.writeHead(206, {
	    // ADD CODE - see tutorial 7 classroom slide #22
			   "Content-Range": "bytes " + start + "-" + end + "/" + total,
                        "Content-Length": chunksize,
                        "Accept-Ranges": "bytes",
                        "Content-Type":"video/mp4"
      	});

      	// create ReadStream object, specifying start, end values computed
    	// above to read range of bytes rather than entire file
      	var stream = fs.createReadStream(file, { start: start, end: end })
        // when ReadStream is open
        .on("open", function() {
          // use stream pipe() method to send the HTTP response object,
        // with flow automatically managed so destination is not overwhelmed
		stream.pipe(res);
        // when error receiving data from stream, send error back to client.
        // stream is auto closed
        }).on("error", function(err) {
            res.end(err);
        });
    });
};

// NOTE, you would use uploadImage only if you chose to implement
// image-upload using Blobs with the HTML5 API.  If instead your
// server saves images directly from your model's poster value,
// you do NOT need the uploadImage route handler
// upload an image file; returns image file-path on server
 exports.uploadImage = function(req, res) {
     // req.files is an object, attribute "file" is the HTML-input name attr
     var filePath = req.files.path;   // ADD CODE to get file path
         fileType = req.files.type;   // ADD CODE to get MIME type
//         // extract the MIME suffix for the user-selected file
         suffix = // ADD CODE
//         // imageURL is used as the value of a movie-model poster field
// 	// id parameter is the movie's "id" attribute as a string value
         imageURL = 'img/uploads/' + req.params.id + suffix,
//         // rename the image file to match the imageURL
         newPath = __dirname + '/../public/' + imageURL;
     fs.rename(filePath, newPath, function(err) {
         if (!err) {
             res.status(200).send(imageURL);
         } else {
             res.status(500).send("Sorry, unable to upload poster image at this time ("
                 +err.message+ ")" );
 	}
     });
};
