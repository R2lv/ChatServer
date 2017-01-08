const Api = require("../classes/Api");

let api = new Api("http://social:85");

const User = function(socket, automaticAuth) {
    const self = this;

    // Private Variables
    self._sockets = [];
    self._listeners = {};

    // Public variables
    self.info = {};

    self.active = null;
    self.authenticated = false;

    // Private Functions
    self._init = function() {
        self.addSocket(socket);
        if(automaticAuth) {
            self.authenticate();
        }
    };

    self._triggerEvent = function(event, ...args) {
        if(self._listeners.hasOwnProperty(event)) {
            for(const k in self._listeners[event]) {
                self._listeners[event][k].call(...args);
            }
        }
    };

    self._addSocketListeners = function(sock) {
        sock.on("disconnect", function() {
            self.removeSocket(sock);
        });
        sock.on("message", function(data) {
            if(typeof data == "object") {
                self._triggerEvent("message", self, data, socket);
            }
        });
    };

    // Public Functions
    self.authenticate = function() {
        User.GetUserInfoBySocket(socket, (data) => {
            self.info = data;
            self.authenticated = false;
            self._triggerEvent("authenticated", self);
        });
    };

    self.addSocket = function(sock) {
        self._sockets.push(sock);

        self._addSocketListeners(sock);

        if(!self.active) {
            self.active = true;
            self._triggerEvent("activated", self);
        }
    };

    self.removeSocket = function(sock) {
        self._sockets.splice(self._sockets.indexOf(sock),1);

        if(self._sockets.length===0) {
            self.active = false;
            self._triggerEvent("offline", self);
        }
    };

    self.addListener = function(type, func) {
        if(self._listeners.hasOwnProperty(type)) {
            self._listeners[type].push(func);
        } else {
            self._listeners[type] = [func];
        }
    };


    self.emit = function(name,message) {
        if(!self.authenticated) return;
        self._sockets.forEach(function(socket) {
            socket.emit(name, message);
        });
    };

    self.disconnect = function() {
        for(const key in self._sockets) {
            self._sockets[key].disconnect();
        }
    };

    self.isFollowing = function(id) {
        return self.authenticated && self.info.following.indexOf(id) != -1;
    };

    self.hasFollower = function(id) {
        return self.authenticated && self.info.followers.indexOf(id) != -1;
    };

    self.sendMessage = function(message) {
        self.emit("message", message);
    };

    // Initialization
    self._init();
};

User.RetrieveUserId = function(socket,next) {
    socket.emit("open session", "", function(data) {
        console.log(data);
        api.post("/io/io.php", {password: "123456789"}, function(err,res,body) {
            if(body.error===0) {
                next(data, body.userid)
            } else {
                socket.disconnect();
            }
        }, {
            "Cookie": "PHPSESSID="+data
        });
    });
};

User.GetUserInfoBySocket = function(socket, fn) {
    api.post("/io/io.php", {password: "123456789"}, function(err,res,body) {
            fn({
                id: body.userid,
                fullname: body.fullname,
                followers: body.followers.split(","),
                following: body.following.split(","),
                image: body.image
            });
        }, {
        "Cookie": "PHPSESSID="+socket.sessionId
    });
};



exports = module.exports = User;