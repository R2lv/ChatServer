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
        console.log(data);
    });
});

io.on('connection', function(socket) {
    usersController.addUserBySocket(socket);
});