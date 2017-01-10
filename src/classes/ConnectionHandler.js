const User = require("./User");
const Client = require("./Client");

const ConnectionHandler = function(io) {
    const self = this;

    // Private Variables
    const _users = {};
    const _listeners = {};

    // Public Variables


    // Private Functions
    const _triggerEvent = function(event, ...args) {
        if(_listeners.hasOwnProperty(event)) {
            for(let fn of _listeners[event]) {
                fn.call(...args);
            }
        }
    };

    const _setUserListeners = function(user) {
        user.addListener("offline", function() {
            self.removeUserById(user.profile.id);
        });
    };


    self.addClientToUser = function(client) {

        if(!_users.hasOwnProperty(client.info.userId)) {
            _users[client.info.userId] = new User();
            _setUserListeners(_users[client.info.userId]);
            _triggerEvent("user connected", self, _users[client.info.userId]);
        }

        _users[client.info.userId].addClient(client);

    };

    self._init = function() {
        io.on("connection", function(socket) {

            let client = new Client(socket);

            client.identify(function() {
                self.addClientToUser(this);
            });

        });
    };

    self._init();

    self.removeUserById = function(id) {
        delete _users[id];
    };

    self.getUserById = function(id) {
        return _users[id];
    };

    self.addListener = function(type, func) {
        if(_listeners.hasOwnProperty(type)) {
            _listeners[type].push(func);
        } else {
            _listeners[type] = [func];
        }
    };

    /*
    * @param {object} user All but this user will receive the message
    * @param {object} message Message Object
    **/
    self.sendToAllBut = function(user, message) {
        for(const key in _users) {
            if(user.id === _users[key].id) {
                continue;
            }
            _users[key].sendMessage(message);
        }
    };

    /*
    * @param {object} user All but this user will receive the message
    * @param {object} message Message Object
    **/
    self.emitToAllBut = function(user, name, data) {
        for(const key in _users) {
            if(user.info.id === _users[key].info.id) {
                continue;
            }
            _users[key].emit(name, data);
        }
    };

    /*
    * @param {object} user User who will receive the message
    * @param {object} message Message Object
    **/
    self.sendTo = function(user, message) {
        if(typeof user == "object") {
            user = user.info.id;
        }
        if(_users.hasOwnProperty(user)) {
            _users[user].sendMessage(message);
        }
    };

    /*
    * @param {object} user User who will receive the message
    * @param {object} message Message Object
    **/
    self.emitTo = function(user, name, data) {
        if(typeof user == "object") {
            user = user.info.id;
        } else {
            _users[user].emit(name, data);
        }
    };

    /*
    * @param {array} ids ID's of the users who will receive the message.
    * @param {object} message Message Object
    **/
    self.sendToList = function(ids, message) {
        if(Array.isArray(ids)) {
            ids.forEach(function(id) {
                if(_users.hasOwnProperty(id)) {
                    _users[id].sendMessage(message);
                }
            });
        }
    };

    /*
    * @param {array} ids ID's of the users who will receive the event by name.
    * @param {object|string|array} data Object to be send
    **/
    self.emitToList = function(ids, name, data) {
        if(Array.isArray(ids)) {
            ids.forEach(function(id) {
                if(_users.hasOwnProperty(id)) {
                    console.log("Emitting to", id);
                    _users[id].emit(name, data);
                }
            });
        }
    }

};

exports = module.exports = ConnectionHandler;