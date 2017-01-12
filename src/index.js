const io = require("socket.io")(2017);
const Api = require("./classes/Api");
// var User = require("./models/UserModel");
const ConnectionHandler = require("./classes/ConnectionHandler");

const api = new Api("http://social:85");

const handler = new ConnectionHandler(io, {
    /*

    authentication: function(info, callback) {
        api.post("/io/io.php", {password: "123456789"}, function(err,res,body) {
            let profile = {
                id: body.userid,
                fullname: body.fullname,
                followers: body.followers.split(","),
                following: body.following.split(","),
                image: body.image
            };
            callback(profile);
        }, {
            "Cookie": "PHPSESSID="+info.sessionId
        });
    },
    identification: function(callback) {
        api.post("/io/io.php", {password: "123456789"}, function(err,res,body) {
            if(body.error===0) {
                callback({
                    userId: body.userId,
                    sessionId: body.sessionId
                });
            } else {
                socket.disconnect();
            }
        }, {
            "Cookie": "PHPSESSID="+data
        });
    }

    */
});

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

    user.addListener("message", function(data, client) {
        console.log(data);
    });

    user.on("test", function() {
        console.log(this);
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
                self.sendToAllExcept(message, socket);
                break;
            case "FOLLOWERS":
                self.sendToList(this.followers, message);
                break;
        }

    });

});*/
