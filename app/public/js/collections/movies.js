'use strict';

var splat =  splat || {};

splat.Movies = Backbone.Collection.extend({
    model:splat.Movie,

    //A1: Save movie models under the "splat" namespace.
    localStorage: new Backbone.LocalStorage('splat')
});
