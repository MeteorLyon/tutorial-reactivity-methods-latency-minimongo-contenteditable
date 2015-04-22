var goToHome = goToIncrement = function () {
        this.render('increment');
        this.render('navbar', {"to": "menu"});
    },
    goToOnDemand = function () {
	var urls = {
	    css: "//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.5/styles/default.min.css",
	    js: "//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.5/highlight.min.js"
	};

	if (Meteor.isClient) {
	    var link = document.createElement('link'),
	        script = document.createElement('script');

	    link.rel = "stylesheet";
	    link.href = urls.css;

	    script.src = urls.js;
	    script.type = "text/javascript";
	    script.async = true;

    	    document.querySelector('head').appendChild(link);
	    var scripts = document.getElementsByTagName('script')[0];
            scripts.parentNode.insertBefore(script, scripts);
	}

        this.render('onDemand');
        this.render('navbar', {"to": "menu"});
    },
    goToPersistence = function() {
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

