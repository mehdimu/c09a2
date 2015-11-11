"use strict";

var mongoose = require('mongoose'); // MongoDB integration
var config = require("../config");

// Connect to database, using credentials specified in your config module
mongoose.connect('mongodb://' +config.dbuser+ ':' +config.dbpass+
                '@10.15.2.164/' + config.dbname);

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

// Constraints
// each title:director pair must be unique; duplicates are dropped
MovieSchema.index({title: 1});  // ADD CODE

// Models
var MovieModel = mongoose.model('Movie', MovieSchema);

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

// NOTE, you would use uploadImage only if you chose to implement
// image-upload using Blobs with the HTML5 API.  If instead your
// server saves images directly from your model's poster value,
// you do NOT need the uploadImage route handler
// upload an image file; returns image file-path on server
// exports.uploadImage = function(req, res) {
//     // req.files is an object, attribute "file" is the HTML-input name attr
//     var filePath = req.files. ...   // ADD CODE to get file path
//         fileType = req.files. ...   // ADD CODE to get MIME type
//         // extract the MIME suffix for the user-selected file
//         suffix = // ADD CODE
//         // imageURL is used as the value of a movie-model poster field
// 	// id parameter is the movie's "id" attribute as a string value
//         imageURL = 'img/uploads/' + req.params.id + suffix,
//         // rename the image file to match the imageURL
//         newPath = __dirname + '/../public/' + imageURL;
//     fs.rename(filePath, newPath, function(err) {
//         if (!err) {
//             res.status(200).send(imageURL);
//         } else {
//             res.status(500).send("Sorry, unable to upload poster image at this time ("
//                 +err.message+ ")" );
// 	}
//     });
// };




