### Meteor Quick Sample ###

## Packages ##

For simplicity, the project uses following packages:

 - iron:router
 - underscore
 - twbs:bootstrap

## Aim ##

There is 3 tabs that represent 3 main concepts of Meteor

# Local reactivity #

When you click on the button, all depending DOM parts will be refreshed.
That's because it's based on Session. All Session's values are based on Tracker package. It allows our code to observe all modification on used Session's vars. When a modification happen, the code that depend on it will be re-run.

# Methods and Latency compensation #

You can write code once, and use it on both client and server. To simulate the latency, i set a wait when the code is run on the server. The result value will be modified 2 seconds after the click.
That behaviour will alow you to code faster. Don't forget to manage error : when the methods works on client but fails on server, then Meteor will set the environment to its previous state.

# Pub/Sub and Minimongo #

When you use Collection, your client will subscribe to data published by your server. The package `autopublish` will manage by itself the pub/sub behaviour. But if you have too many data, you have to manage it manually. It's usefull when starting project but you will quickly remove autopublish.
Minimongo allow you to acces Collection and manipulate them directly on client side, and in the same way you would do on server. 
Here ther is a Members Collection, and you can add and modify what you want using HTML li[contenteditable]

