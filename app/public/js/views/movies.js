"use strict";

var splat =  splat || {};

splat.MoviesView = Backbone.View.extend({

    moviesTemplate: _.template([
        "<% movies.each(function(movie) { %>",
            "<%= movieTemplate(movie.toJSON()) %>",
        "<% }); %>",
    ].join('')),

    initialize: function (options) {
        console.log("i am in initilaize of movies");
        this.listenTo(Backbone, 'orderevent', this.render);
    },

    // When the MovieView template has loaded, take the template read in
    // (markup) and turn that into a movieTemplate function, then apply the
    // moviesTemplate function to the movies collection with the movieTemplate.
    // Append the resulting HTML to the MoviesView el (DOM element).
    render: function() {
        // comparator function on collection is the basis for comparing movie
        // models
        console.log("i am in render of movies");
        this.collection.comparator = function(movie) {
            console.log(splat.order);
            return movie.get(splat.order); // ADD CODE to select comparator field
        };
        // sort collection before rendering it - implicitly uses comparator
        this.collection.sort();
        // rest of render, as before
        var movieThumbView = new splat.MovieThumb();
        var html = this.moviesTemplate({
            movies: this.collection,
            movieTemplate: movieThumbView.template
        });
        $(this.el).append(html);

       	// support chaining
        return this;
    },

    onClose: function() {
        this.remove();
    }

});
