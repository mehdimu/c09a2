/**
  * @author Alan Rosselet
  * @version 0.1
  */

// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat =  splat || {};

/**
  * @constructor HeaderView constructs the app header view
  */
splat.Header = Backbone.View.extend({

    render: function() {
	// create DOM content for header
        this.$el.html(this.template()); 
        return this;
    },

    /**
      * @param {String} menuItem  highlights as active the header menuItem
      */
    // Set Bootstrap "active" class to visually highlight the active header item
    selectMenuItem: function (menuItem) {
        $('.nav li').removeClass('active');
        if (menuItem) {
            $('.' + menuItem).addClass('active');
        };
    }

});
