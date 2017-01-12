const User = require("./User");
const Client = require("./Client");

/**
 * Creates new ConnectionHandler object that handles socket.io connections, this is base class of the framework
 * @class
 * @param {Object} io Socket.io object that should be handled by framework
 * @param {object} config Config variable
 * */
const ConnectionHandler = function(io, config) {
    const self = this;

    // Private Variables
    const _users = new Map();
    const _listeners = new Map();

    // Public Variables


    // Private Functions
    const _triggerEvent = function(event, ...args) {
        if(_listeners.has(event)) {
            for(let fn of _listeners.get(event)) {
                fn.call(...args);
            }
        }
    };


    const _setUserListeners = function(user) {

        user.addListener("offline", function() {
            self.removeUserById(user.profile.id);
        });

    };

    const _setConfig = function() {
        if(config===undefined) return;
        if(config.identification) {
            Client.prototype.identification = config.identification;
        }
        if(config.authentication) {
            Client.prototype.authentication = config.authentication;
        }
    };


    const init = function() {

        _setConfig();

        io.on("connection", function(socket) {
            let client = new Client(socket);
            client.identify(function() {
                self.addClientToUser(this);
            });

        });
    };

    init();

    /**
     * Adds client to the relevant user, if there's not such user, creates new and fires "user connected" event
     * @public
     * @method
     * @param {Client} client Newly connected client (socket)
     * */
    self.addClientToUser = function(client) {

        if(!_users.has(client.info.userId)) {
            _users.set(client.info.userId, new User());
            _setUserListeners(_users.get(client.info.userId));
            _triggerEvent("user connected", self, _users.get(client.info.userId));
        }

        _users.get(client.info.userId).addClient(client);

    };

    /**
     * Disconnects user by id
     * @public
     * @method
     * @param {Number|string} id Id of the user to be disconnected
     * */
    self.disconnectUser = function(id) {
        if(_users.has(id)) {
            _users.get(id).disconnect();
        }
    };

    /**
     * Returns User object associated to id
     * @public
     * @method
     * @param {string,number} id ID of the user to be returned
     * */
    self.getUser = function(id) {
        return _users.get(id);
    };

    self.addListener = function(type, fn) {
        if(_listeners.has(type)) {
            _listeners.get(type).push(fn);
        } else {
            _listeners.set(type, [fn]);
        }
    };

    /**
     * Send message to all users except one
     * @public
     * @method
     * @param {User} user All user except this will receive the message
     * @param {object} message Message object
     * */
    self.sendToAllExcept = function(user, message) {
        _users.forEach(function(user, _id) {
            if(user.id === _id) {
                return;
            }
            user.sendMessage(message);
        });
    };

    /**
     * Emit data to all users except one
     * @public
     * @method
     * @param {User} user All user except this will receive the data
     * @param {string} name Name of the data to be emitted
     * @param {Array|Object|string} data Data to be emitted
     * */
    self.emitToAllExcept = function(user, name, data) {
        for(let [key,usr] of _users) {
            if(user.info.id === key) {
                continue;
            }
            usr.emit(name, data);
        }
    };

    /**
     * Send message to user
     * @public
     * @method
     * @param {User} user User to send message to
     * @param {object} message Message Object
     * */
    self.sendTo = function(user, message) {
        if(typeof user == "object") {
            user = user.info.id;
        }
        if(_users.has(user)) {
            _users.get(user).sendMessage(message);
        }
    };

    /**
     * Emit data to user
     * @public
     * @method
     * @param {User} user User who will receive the data
     * @param {string} name Name of the data to be emitted
     * @param {Array|string|object} data Data to be emitted
     * */
    self.emitTo = function(user, name, data) {
        if(typeof user != "object") {
            user = _users.get(user);
        }
        user.emit(name, data);
    };

    /*
    * @param {array} ids ID's of the users who will receive the message.
    * @param {object} message Message Object
    **/
    self.sendToList = function(ids, message) {
        if(Array.isArray(ids)) {
            ids.forEach(function(id) {
                if(_users.has(id)) {
                    _users.get(id).sendMessage(message);
                }
            });
        }
    };

    /**
     * @param {Array} ids ID's of the users who will receive data by name.
     * @param {string} name Name of the data to be emitted
     * @param {object|string|Array} data Data to be emitted
     *
     * */
    self.emitToList = function(ids, name, data) {
        if(Array.isArray(ids)) {
            ids.forEach(function(id) {
                if(_users.has(id)) {
                    _users.get(id).emit(name, data);
                }
            });
        }
    }

};

exports = module.exports = ConnectionHandler;