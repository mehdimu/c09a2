"use strict";

var splat =  splat || {};

splat.ReviewsView = Backbone.View.extend({

    reviewsTemplate: _.template([
            "<% reviewTemplate(review.toJSON()); %>",
    ].join('')),

    initialize: function() {
        // other stuff ? ...
        // invoke showScore and renderReviews methods when collection is sync'd
        console.log("i am in initialize");
        this.listenTo(this.reviews, "sync", this.showScore);
        this.listenTo(this.reviews, "sync", this.renderReviews);
    },

    render: function() {
        // render self (from ReviewsView template), then Reviewer subview,
        // then ReviewThumbs subview, then showFreshness (current aggregate rating)
        // can all be chained, as in this.renderX().renderY().renderZ() ...
        var self = this;
        var reviewThumbView = new splat.ReviewThumb();
        this.collection.each(function(review) {
            if (review.get('movieId') === self.id) {
                var html = reviewThumbView.template(review.toJSON());
                $(self.el).append(html);
            }
        })

        // support chaining
        return this;
    }

});
