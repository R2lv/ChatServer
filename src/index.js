const io = require("socket.io")(2017);
// var User = require("./models/UserModel");
const ConnectionHandler = require("./classes/ConnectionHandler");


const handler = new ConnectionHandler(io);

handler.addListener("user connected", function(user) {

    user.addListener("online", function() {
        console.log(`${this.profile.fullname} is online`);
    });

    user.addListener("offline", function() {
        console.log(`${this.profile.fullname} is offline`);
    });

    user.addListener("client authenticated", function(client) {
        console.log(`${client.info.userId} connected as client of ${this.profile.fullname}, connected ${this.getClientLength()} clients`);
    });

    user.addListener("client disconnected", function(client) {
        console.log(`${client.info.userId} client disconnected from ${this.profile.fullname}, left ${this.getClientLength()}`);
    });

    user.addListener("message", function(data) {
        console.log(data);
    });

});


/*

usersController.addListener("userConnected", function(user) {
    const self = this;

    user.addListener("authenticated", function() {

        self.emitToList(this.info.followers, "online", this.info);

        const list = [];

        this.info.following.forEach(function(f) {
            let usr;
            if((usr = self.getUserById(f))!=null) {
                list.push(usr.info);
            }
        });
        this.emit("updateOnline", list);
    });

    user.addListener("offline", function() {
        self.emitToList(this.info.followers, "offline", this.info);
    });

    user.addListener("message", function(data, socket) {

        let message = {
            message: data.message,
            from: this.info,
            type: data.type
        };


        /// Just to get messages back to me (In case if i have opened multiple browser tabs)
        // self.sendTo(this, message);

        switch(data.type) {
            case "PM":
                self.sendTo(data.user, message);
                break;
            case "ALL":
                self.sendToAllBut(message, socket);
                break;
            case "FOLLOWERS":
                self.sendToList(this.followers, message);
                break;
        }

    });

});*/
