"use strict";

var splat =  splat || {};

splat.ReviewsView = Backbone.View.extend({

    initialize: function() {
        // other stuff ? ...
        // invoke showScore and renderReviews methods when collection is sync'd
        this.listenTo(this.reviews, "sync", this.showScore);
        this.listenTo(this.reviews, "sync", this.renderReviews);
    }
    render: function() {
        // render self (from ReviewsView template), then Reviewer subview,
        // then ReviewThumbs subview, then showFreshness (current aggregate rating)
        // can all be chained, as in this.renderX().renderY().renderZ() ...
    }

});
