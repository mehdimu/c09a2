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
    
    events: {
        ""
        "change input[type=radio]" : "sortOrder"
    },
    
    render: function() {
	     // create DOM content for header

        this.$el.html(this.template()); 
        return this;
    },

    sortOrder: function(event) {
        console.log("i am in sortOrder");
        event.stopPropagation();
        splat.order = event.target.value;  // set app-level order field
        Backbone.trigger('orderevent', event);  // trigger event for other views
        $('.dropdown').removeClass('open');  // close the dropdown menu
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
