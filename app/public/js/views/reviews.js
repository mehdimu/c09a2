"use strict";

var splat =  splat || {};

splat.ReviewsView = Backbone.View.extend({

    reviewsTemplate: _.template([
        "<% reviews.each(function(review) { %>",
            "<%= reviewTemplate(review.toJSON()) %>",
        "<% }); %>",
    ].join('')),

    initialize: function() {
        // other stuff ? ...
        // invoke showScore and renderReviews methods when collection is sync'd
        this.render();
        this.listenTo(this.reviews, "sync", this.showScore);
        this.listenTo(this.reviews, "sync", this.renderReviews);
    },

    render: function() {
        // render self (from ReviewsView template), then Reviewer subview,
        // then ReviewThumbs subview, then showFreshness (current aggregate rating)
        // can all be chained, as in this.renderX().renderY().renderZ() ...
        console.log("called in reviews.js render");
        var reviewThumbView = new splat.ReviewThumb();
        var html = this.reviewsTemplate({
            reviews: this.collection,
            reviewTemplate: reviewThumbView.template
            });
        $(this.el).append(html);

        return this;
    }

});
