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
MovieSchema.index({title: 1, director: 1});  // ADD CODE
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

// retrieve all movies
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

//add a movie
exports.addMovie = function(req, res) {
    var movie = new MovieModel(req.body);
    //Saving poster-image by saving the movie model
    if (req.body.poster.match(/^data:image\/jpeg;base64,/)) {
        saveImageToServer(req.body.poster, movie._id);
        movie.poster = "/img/" + movie._id + ".jpg";
    }

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
    delete req.body._id;

    if (req.body.poster.match(/^data:image\/jpeg;base64,/)) {
        saveImageToServer(req.body.poster, id);

        req.body.poster = "/img/" + id + ".jpg";
    }

    //Updating a movie by ID
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
//Save poster images to the server instead by writing the url path
var saveImageToServer = function(base64, id) {
    var base64Data = base64.replace(/^data:image\/jpeg;base64,/, "");
    var file = path.resolve(__dirname,"../public/img/" + id + ".jpg");
    fs.writeFile(file, base64Data, 'base64', function(err) {
      console.log(err);
    });
}

//Delete model reviews
exports.deleteMovie = function(req, res) {
   //Find movie by Id to remove it
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
//Retrieve all reviews
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
    //Assign rating values
    if (req.body.rating === 'fresh') {
        freshness = 1.0;
    }
    else {
        freshness = 0.0;
    }

    delete req.body.rating;
    req.body.freshness = freshness;
    req.body.movieId = req.params.id;

    //Update the freshness count
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
    // compute absolute file-system video path from __dirname and URL with id
    var file = path.resolve(__dirname,"../public/videos/" + req.params.id + ".ogx");
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
