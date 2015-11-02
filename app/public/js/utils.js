"use strict";

var splat = splat || {};

splat.utils = {

    // Asynchronously load templates located in separate .html files using
    // jQuery "deferred" mechanism, an implementation of Promises.  Note we
    // depend on template file names matching corresponding View file names,
    // e.g. HomeView.html and home.js which defines Backbone View HomeView.
    loadTemplates: function(views, callback) {

        var deferreds = [];

        $.each(views, function(index, view) {
            if (splat[view]) {  // splat[view] is defined as a Backbone View
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
		    // splat[view].prototype.template is a template function
                    splat[view].prototype.template = _.template(data);
                }));
            } else {
		// if you see this alert when loading your app, it usually
		// means you've got a syntax error in the named Backbone View
                alert(view + " not found");
            }
        });
	// all the deferreds have completed, now invoke the callback (function)
        $.when.apply(null, deferreds).done(callback);
    },

    displayValidationErrors: function(messages) {
        for (var key in messages) {
            if (messages.hasOwnProperty(key)) {
                this.addValidationError(key, messages[key]);
            }
        }
        this.showAlert('Error!', 'Fix validation errors and try again',
							'alert-danger');
    },

    addValidationError: function(field, message) {
        //var controlGroup = $('#' + field).parent();
	if (field === "synopsis") {
	    var formGroup = $("textarea").parent();
	} else {
            var formGroup = $("input[name='" + field + "']").parent();
	};
        formGroup.addClass('has-error');  // was 'error' in Bootstrap 2
        $('.help-block', formGroup).html(message);
    },

    removeValidationError: function(field) {
	if (field === "synopsis") {
	    var formGroup = $("textarea").parent();
	} else {
            var formGroup = $("input[name='" + field + "']").parent();
	};
        formGroup.removeClass('has-error');  // was 'error' in Bootstrap 2
        $('.help-block', formGroup).html('');
    },

    showAlert: function(title, text, klass) {
        $('.alert').removeClass("alert-danger alert-warning alert-success alert-info");
        $('.alert').addClass(klass);
        $('.alert').html('<strong>' + title + '</strong> ' + text);
        $('.alert').stop(true,true).show().fadeOut(5000);
    },

    hideAlert: function() {
        $('.alert').stop(true,true).hide();
    }

};
