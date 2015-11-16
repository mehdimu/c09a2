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
        "mouseover":"handleHover",
        "change input[type=radio]" : "sortOrder"
    },
 handleHover: function() {
        $('ul.nav li.dropdown').hover(function() {
          $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500);
        }, function() {
          $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500);
        });
    },
    render: function() {
	     // create DOM content for header

        this.$el.html(this.template()); 
        return this;
    },

    sortOrder: function(event) {
        event.stopPropagation();
        splat.order = event.target.value;  // set app-level order field
        Backbone.trigger('orderevent', event);  // trigger event for other views
        //$('.dropdown-menu').removeClass('open');  // close the dropdown menu
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
