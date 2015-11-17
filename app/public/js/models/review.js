'use strict';

var splat =  splat || {};

splat.Review = Backbone.Model.extend({

    idAttribute: "_id",	// to match localStorage, which uses _id rather than id

    initialize: function() {
    },

    defaults: {
      freshness: 0.0,
      reviewText: "",
      reviewName: "",
      reviewAffil: "",
      movieId: ""
    }

  });
