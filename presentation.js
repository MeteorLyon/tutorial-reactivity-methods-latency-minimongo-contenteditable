
Members = new Meteor.Collection('medialabs-members');

if (Meteor.isClient) {
    // counter starts at 0
    Session.setDefault('counter', 0);

    Template.navbar.helpers({
        "navBars": function () {
            return NavBars.find();
        },
        "active": function () {
            return Router.current().location.get().path == this.url ? "active" : "";
        }
    });

    Template.increment.helpers({
        counter: function () {
            return Session.get('counter');
        },
        getColor: function () {
            var hexColor = parseInt(Session.get('counter')).toString(16);

            return String('00FF00' + hexColor).slice(-6);
        }
    });

    Template.increment.events({
        'click button': function () {
            // increment the counter when button is clicked
            Session.set('counter', Session.get('counter') + 1);
        }
    });

    Template.onDemand.myCb = function (error, results) {
        var container = $("#onDemand-result"),
            display;

        if (!container.length) {
            return;
        }

        container.empty();

        display = JSON.stringify(results);
        container.append(display);
    };

    Template.onDemand.events({
        'click button': function () {
            Meteor.call('ping', 1, Template.onDemand.myCb);
        }
    });

    Template.persistence.helpers({
        getMembers: function () {
            return Members.find();
        }
    });

    Template.persistence.events({
        'keypress ul li span[contenteditable="true"]': function (event) {
            // prevent line break when return key is used
            if (event.charCode == 13) {
                event.preventDefault();
                event.currentTarget.blur();
            }
        },

        'click ul li button': function (event) {
            Members.remove({_id: this._id});
        },

        'blur ul li span[data-insert="true"]': function (event) {
            var firstname = event.currentTarget.innerText.trim() || event.currentTarget.innerHTML.trim();

            if (firstname.length) {
                Members.insert({firstname: firstname});
            }

            event.currentTarget.innerHTML = "";
        },

        'blur ul li span[data-update="true"]': function (event) {
            var firstname = event.currentTarget.innerText || event.currentTarget.innerHTML;

            Members.update({_id: this._id}, {$set: {firstname: firstname}});
        }
    });

    var membersUiHooks = {
        insertElement: function (node, next) {
            var offScreenClass = 'list-group-item-info',
                jNode = $(node);

            jNode.hide()
                .addClass(offScreenClass)
                .insertBefore(next)
                .fadeIn();

            setTimeout(function () {
                jNode.removeClass(offScreenClass);
            }, 2000);
        },

        moveElement: function (node, next) {
            var offScreenClass = 'list-group-item-warning',
                jNode = $(node);

            jNode.addClass(offScreenClass);

            setTimeout(function () {
                jNode.removeClass(offScreenClass);
            }, 2000);
        },

        removeElement: function (node) {
            var offScreenClass = 'list-group-item-warning',
                jNode = $(node);

            jNode.addClass(offScreenClass);

            setTimeout(function () {
                jNode.fadeOut()
                    .remove();
            }, 2000);

        }
    };

    Template.persistence.rendered = function () {
        this.find('ul')._uihooks = membersUiHooks;
    };
}

Meteor.methods({
    "ping": function (params) {
        var platform = {
                "server": Meteor.isServer,
                "client": Meteor.isClient
            },
            result = {result: "pong", params: arguments, platform: platform, simulation: this.isSimulation};

        if (this.isSimulation) {
            // on client display result
            Template.onDemand.myCb(null, result);
        } else {
            // on server simulate latency to allow display on client of simulated results
            Meteor._sleepForMs(3000);
        }

        return result;
    }
});

if (Meteor.isServer) {
    Meteor.startup(function () {
// code to run on server at startup
    });
}
