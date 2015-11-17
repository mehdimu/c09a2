"use strict";

var splat =  splat || {};

splat.ReviewsView = Backbone.View.extend({

    events: {
        "click #reviewsave" : "reviewSave",
        "change .reviewattr" : "change"
    },

    reviewsTemplate: _.template([
            "<% reviewTemplate(review.toJSON()); %>",
    ].join('')),

    initialize: function(options) {
        this.options = options || {};
        // other stuff ? ...
        // invoke showScore and renderReviews methods when collection is sync'd
        this.listenTo(this.reviews, "sync", this.showScore);
        this.listenTo(this.reviews, "sync", this.renderReviews);
    },

    render: function() {
        // render self (from ReviewsView template), then Reviewer subview,
        // then ReviewThumbs subview, then showFreshness (current aggregate rating)
        // can all be chained, as in this.renderX().renderY().renderZ() ...
        var self = this;
        var reviewThumbView = new splat.ReviewThumb();
        var reviewerView = new splat.Reviewer();
        console.log(this);
        $(self.el).append(reviewerView.template(this.options.moviemodel.toJSON()));
        this.model.collection.each(function(review) {
            if (review.get('movieId') === self.id) {
                var html = reviewThumbView.template(review.toJSON());
                $(self.el).append(html);
            }
        })

        // support chaining
        return this;
    },

    change: function(event) {
        var change = {};
        change[event.target.name] = event.target.value;
        this.model.set(change);
        console.log(event.target.value);
    },

    reviewSave: function() {
        this.model.url = "/movies/" + this.id + "/reviews";
        this.model.collection.create(this.model, {
            wait: true,
            success: function(model, response) {
                console.log("saved review");
            },
            failure: function(model, response) {
                console.log("The model failed");
            }
        });
    }

});
