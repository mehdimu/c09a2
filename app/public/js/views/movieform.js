"use strict";

var splat =  splat || {};

splat.MovieForm = Backbone.View.extend({

    events: {
        "change .authattr"        : "change",
        "click #moviesave"   : "beforeSave",
        "click #moviedel" : "deleteMovie",
    },

    render:function () {
        this.$el.html(this.template(this.model.toJSON()));
	return this;
    },

    // note that "delete" is a function bound to an individual Movie
    // whereas "add" is a function associated with a MoviesView
    deleteMovie: function(event) {
        var isnew = this.model.isNew();   // newly added model
        // delete Model
        this.model.destroy({
	    wait: true,  // don't destroy the model until server responds
            success: function(model, resp) {
              splat.app.navigate('/movies', {replace:true, trigger:true});
              splat.utils.showAlert('Success', "Movie deleted", 'alert-success')
            },
            error: function(model, resp) {
                splat.utils.requestFailed(resp);
            }
          });
        return false;
    },

    change: function (event) {
        // Remove any existing alert message
        splat.utils.hideAlert();
        var change = {};

        // Apply the change to the model
        // note change is triggered once for each changed field value
        change[event.target.name] = event.target.value;
	// starring and genre inputs are comma-separated string arrays
	if (event.target.name === 'starring' || event.target.name === 'genre') {
	    var list = event.target.value.split(",");
	    change[event.target.name] = list;
	}
        // reflect changes in the model
        this.model.set(change);
        // Run validation rule (if any) on changed item
        var check = this.model.validateItem(event.target.name);
        check.isValid ?
              splat.utils.removeValidationError(event.target.name)
            : splat.utils.addValidationError(event.target.name, check.message);

        splat.utils.showAlert('Note!', 'Movie attribute updated; '
		+ 'to make changes permanent, click "Save Changes" button',
		'alert-info');
    },

    beforeSave: function() {
        var self = this;
        var check = self.model.validateAll();
        if (check.isValid === false) {
            splat.utils.displayValidationErrors(check.messages);
            return false;
        };
	this.saveMovie();
    },

    saveMovie: function() {
	var newMovie = this.model.isNew();
	this.model.collection.create(this.model, {
            wait: true,
            success: function(model, response) {
                // Set the URL, to reflect the assigned movie-id for new movies
		if (newMovie) {
                    splat.app.navigate('movies/' + model._id, {replace:true});
        	    model.reviews.url = '/movies/' + model._id + '/reviews';
		};
                splat.utils.showAlert('Success!', 'Movie saved', 'alert-success');
            },
            error: function (model, err) {
                splat.utils.requestFailed(err);
            }
        });
    }

});
