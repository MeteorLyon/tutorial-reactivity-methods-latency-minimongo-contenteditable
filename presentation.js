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

        display = JSON.stringify(results, undefined, 4); // add 4 spaces
        container.append(display);

        $(container).each(function(i, block) {
            hljs.configure({"tabReplace": true, "useBr": true}); // ask for indent
            hljs.highlightBlock(block);
        });
    };

    Template.onDemand.events({
        'click button': function () {
            Meteor.call('ping', 1, Template.onDemand.myCb);
        }
    });

    Template.persistence.helpers({
        getMembers: function() {
            return Members.find({}, {sort: {date: 0}});
        },

        getNew: function() {
            var cursor = MembersCounter.find(),
                count = cursor.count() ? _.first(cursor.fetch())['count'] : 0;

            return count;
        }
    });

    Template.persistence.events({
        'keypress ul li span[contenteditable="true"]': function (event) {
            // prevent line break when return key is used
            if (event.which === 13) {
                event.preventDefault();
                event.currentTarget.blur();
            }
        },

        'click button#see-new': function (event) {
            Session.set('date', new Date());
        },

        'click ul li button': function (event) {
            Members.remove({_id: this._id});
        },

        'blur ul li span[data-insert="true"]': function (event) {
            var firstname = (event.currentTarget.innerText || event.currentTarget.innerHTML).trim();

            if (firstname.length) {
                // add ownerId to prevent inserted item to be removed because of date Session value
                Members.insert({firstname: firstname, date: new Date(), ownerId: Meteor.userId()});
            }

            event.currentTarget.innerHTML = "";
        },

        'blur ul li span[data-update="true"]': function (event) {
            var firstname = event.currentTarget.innerText || event.currentTarget.innerHTML;

            Members.update({_id: this._id}, {$set: {firstname: firstname}});
        }
    });

    var membersUiHooks = {
        "insertElement": function (node, next) {
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

        "moveElement": function (node, next) {
            var offScreenClass = 'list-group-item-warning',
                jNode = $(node);

            jNode.addClass(offScreenClass);

            setTimeout(function () {
                jNode.removeClass(offScreenClass);
            }, 2000);
        },

        "removeElement": function (node) {
            var offScreenClass = 'list-group-item-warning',
                jNode = $(node);

            jNode.addClass(offScreenClass);

            setTimeout(function () {
                jNode.fadeOut()
                    .remove();
            }, 2000);

        }
    };

    MembersCounter = new Meteor.Collection('newMembersSinceLastView'); // seems important to set the physical name as the same as the subscribtion
    Template.persistence.created = function () { // onCrated doesn't work
        var self = this;

        this.autorun(function() {
            self.subscribe("members", Session.get('date'));
            self.subscribe("newMembersSinceLastView", Session.get('date'));
        });
    };

    Template.persistence.rendered = function () { // onRendered doesn't work
        this.find('ul')._uihooks = membersUiHooks;
    };
}

Meteor.methods({
    "ping": function (params) {
        var platform = {
                "server": Meteor.isServer,
                "client": Meteor.isClient
            },
            result = {
		result: "pong", 
		params: params, 
		platform: platform, 
		simulation: this.isSimulation
	    };

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
        // remove previous guests
        Accounts.removeOldGuests();

        Meteor.publish("members", function(date) {
            return Members.find({$or: [
                {date: {$lt: date}},
                {ownerId: this.userId}
            ]}, {sort: {date: 0}});
        });

        // nouveau pckage : guest+accounts+mongol/jetsetter... ?
        // https://github.com/eventedmind/meteor-observe-in-a-publish-function/blob/master/server/server.js
        Meteor.publish("newMembersSinceLastView", function(date) {
            var subscription = this,
                docId = Meteor.uuid(),
                userId = this.userId,
                observerHandle,
                query = {$and: [
                  {date: {$gt: date}},
                  {ownerId: {$ne: userId}}
                ]},
                cursorMember = Members.find(query),

                count = cursorMember.count();

            // reset counter
            subscription.added("newMembersSinceLastView", docId, {count: 0, ownerId: userId});

            // observe
            observerHandle = cursorMember.observe({
                "added": function(document) {
                    count++;
                    subscription.changed('newMembersSinceLastView', docId, {count: count}); // use changed, not added, because you are not on the same colection in fact !!!

                    console.log('added / changed', count, userId);
                }
            });

            subscription.onStop(function () {
                observerHandle.stop();
            });

            subscription.ready();
        });
    });
}
