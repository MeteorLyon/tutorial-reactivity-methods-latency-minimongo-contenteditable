var goToHome = goToIncrement = function () {
        this.render('increment');
        this.render('navbar', {"to": "menu"});
    },
    goToOnDemand = function () {
        this.render('onDemand');
        this.render('navbar', {"to": "menu"});
    },
    goToPersistence = function() {
        Session.set('date', new Date()); // for counter reset and display new items

        this.render('persistence');
        this.render('navbar', {"to": "menu"});
    },
    routes = [
        {"url": "/increment", "label": "Increment", "controller": goToIncrement},
        {"url": "/onDemand", "label": "On Demand", "controller": goToOnDemand},
        {"url": "/persistence", "label": "Persistence", "controller": goToPersistence}
    ];

NavBars = new Meteor.Collection(null);

Router.configure({
    layoutTemplate: 'ApplicationLayout'
});

Router.route("", goToHome);
_.each(routes, function(item) {
    NavBars.insert(item);
    Router.route(item.url, item.controller);
});