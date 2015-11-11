'use strict';

var splat =  splat || {};

splat.Reviews = Backbone.Collection.extend({
    model:splat.Review,

    url: '/reviews'
});
