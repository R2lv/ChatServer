const io = require("socket.io")(2017);
// var User = require("./models/UserModel");
const UsersController = require("./controllers/UsersController");


const usersController = new UsersController();


usersController.addListener("userConnected", function(user) {
    const self = this;
    user.addListener("authenticated", function() {
        console.log(this.info);
    });

    user.addListener("message", function(data, socket) {
        let message = {
            text: data.text,
            from: this.info,
            type: data.type
        };


        /// Just to get messages back to me (For case if i have opened multiple tabs
        self.sendTo(this, message);

        switch(data.type) {
            case "PM":
                self.sendTo(data.recipient, message);
                break;
            case "ALL":
                self.sendToAllBut(message, socket);
                break;
            case "FOLLOWERS":
                self.sendToList(this.followers, message);
                break;
        }

    });

});

io.on('connection', function(socket) {
    usersController.addUserBySocket(socket);
});