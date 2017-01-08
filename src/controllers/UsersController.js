const User = require("../models/UserModel");

const UsersController = function(io) {
    const self = this;

    // Private Variables
    self._users = {};
    self._listeners = {};

    // Public Variables


    // Private Functions
    self._triggerEvent = function(event, ...args) {
        if(self._listeners.hasOwnProperty(event)) {
            for(const k in self._listeners[event]) {
                self._listeners[event][k].call(...args);
            }
        }
    };


    // Public Functions
    self.addUserBySocket = function(socket, success, fail) {
        User.RetrieveUserId(socket, function(sessionId, userId) {
            socket.userId = userId;
            socket.sessionId = sessionId;


            if(self._users.hasOwnProperty(userId)) {
                self._users[userId].addSocket(socket);
            } else {
                self._users[userId] = new User(socket);
                self._triggerEvent("userConnected", self, self._users[userId]);
                self._users[userId].authenticate();
            }
            if(typeof success == "function") success(self._users[userId]);
        });
    };

    self.removeUserById = function(id) {
        delete self._users[id];
    };

    self.getUserById = function(id) {
        return self._users[id];
    };

    self.addListener = function(type, func) {
        if(self._listeners.hasOwnProperty(type)) {
            self._listeners[type].push(func);
        } else {
            self._listeners[type] = [func];
        }
    };

    self.sendToAllBut = function(message, socket) {
        socket.broadcast.emit("message", message);
    };

    self.sendTo = function(user, message) {
        if(typeof user == "object") {
            user = user.info.id;
        } else {
            self._users[user].sendMessage(message);
        }
    };

    self.sendToList = function(ids, message) {
        if(Array.isArray(ids)) {
            ids.forEach(function(id) {
                if(self._users.hasOwnProperty(id)) {
                    self._users[id].sendMessage(message);
                }
            });
        }
    }

};

exports = module.exports = UsersController;