/**
 * Creates a user with no clients
 * @name User
 * @class
 */
const User = function() {
    const self = this;

    const _clients = [];
    const _listeners = new Map();
    const _clientListeners = new Map();

    /**
     * User information (profile)
     * @var {object} profile
     * @public
     * */
    self.profile = {};

    self.active = null;
    self.authenticated = false;

    const _triggerEvent = function(event, ...args) {
        if(_listeners.has(event)) {
            for(let fn of _listeners.get(event)) {
                fn.call(...args);
            }
        }
    };

    const _addClientListeners = function(client) {

        client.on("disconnect", function() {
            self.removeClient(client);
        });

        client.on("_message_", function(data) {
            if(typeof data == "object") {
                _triggerEvent("_message_", self, data, client);
            }
        });

        _clientListeners.forEach(function(fns, key) {
            for(let fn of fns) {
                client.on(key, fn.bind({
                    user: self,
                    client: this
                }));
            }
        });
    };

    // Public Functions
    /**
     * Authenticates client and authenticates user if not already authenticated
     * @public
     * @method
     * @param {Client} client Authenticates the client and authenticates user (if not authenticated)
     *
     * */
    self.authenticate = function(client) {
        client.authenticate((data) => {
            self.profile = data;
            if(!self.authenticated) {
                self.authenticated = true;
                _triggerEvent("online", self);
                _triggerEvent("authenticated", self);
            }
            _triggerEvent("client authenticated", self, client);
        });
    };

    /**
     * Add client to the User object
     * @public
     * @method
     * @param {Client} client Adds new client to user
     * */
    self.addClient = function(client) {
        _clients.push(client);
        _addClientListeners(client);

        _triggerEvent("client connected", self, client);

        if(!self.active) {
            self.active = true;
            _triggerEvent("activated", self);
        }

        self.authenticate(client);
    };


    /**
     * Add listener to the User object
     * @method
     * @param {string} type Listener type
     * @param {function} fn Callback function
     * */
    self.addListener = function(type, fn) {
        if(_listeners.has(type)) {
            _listeners.get(type).push(fn);
        } else {
            _listeners.set(type, [fn]);
        }
    };

    /**
     * Remove client from user
     * @public
     * @method
     * @param {Client} client Client to be removed from user
     * */
    self.removeClient = function(client) {
        _clients.splice(_clients.indexOf(client),1);

        _triggerEvent("client disconnected", self, client);

        if(_clients.length===0) {
            self.active = false;
            _triggerEvent("offline", self);
        }
    };

    /**
     * Emit data to all clients (sockets) of user
     * @public
     * @method
     * @param {String} name Name of the object to be emitted
     * @param {Object|Array|String} data Data to be emitted
     * */
    self.emitToAllClients = function(name, data) {
        if(!self.authenticated) return;
        _clients.forEach(function(client) {
            client.emit(name, data);
        });
    };

    /**
     * Emit data to all clients except one
     * @public
     * @method
     * @param {String} name Name of the object to be emitted
     * @param {Object|Array|String} data Data to be emitted
     * @param {Client} client Data will be emitted to all clients but this
     * */
    self.emitToAllExcept = function(name, data, client) {
        if(!self.authenticated) return;
        _clients.forEach(function(c) {
            if(c===client) return;
            c.emit(name, data);
        });
    };

    /**
     * Disconnect user (disconnect all clients of this user & go offline)
     * @public
     * @method
     * */
    self.disconnect = function() {
        for(const key in _clients) {
            _clients[key].disconnect();
        }
    };

    /**
     * Emit message (by predefined format) to all clients
     * @public
     * @method
     * @param {string|number} from From field of the message
     * @param {string} message message field of the message
     * @param {string} type type filed of the message
     * */
    self.sendMessage = function(from, message, type) {
        self.emitToAllClients("_message_", {
            user: from,
            message: message,
            type: type
        });
    };


    /**
     * Emit message (by predefined format) to all clients except one
     * @public
     * @method
     * @param {string|number} from From field of the message
     * @param {string} message message field of the message
     * @param {string} type type filed of the message
     * @param {Client} client All clients but this will receive message
     * */
    self.sendMessageExcept = function(from, message, type, client) {
        self.emitToAllExcept("_message_", {
            user: from,
            message: message,
            type: type
        }, client);
    };

    /**
     * Add data listener function to all clients (sockets) of user for data
     * @public
     * @method
     * @param {string} name Name of the message to listen for
     * @param {function} fn Callback function, called when data received by specified name
     * */
    self.on = function(name, fn) {

        _clients.forEach(function(client) {
            client.on(name, fn.bind({
                user: self,
                client: client
            }));
        });

        if(_clientListeners.has(name)) {
            _clientListeners.get(name).push(fn);
        } else {
            _clientListeners.set(name, [fn]);
        }

    };


    /**
     * Remove all data listener functions from all clients (sockets) of user
     * @public
     * @method
     * @param {string} name Name of the listeners to be removed
     * */
    self.offAll = function(name) {
        _clients.forEach(function(client) {
            client.removeAllListeners(name);
        });
        if(_clientListeners.has(name)) {
            _clientListeners.delete(name);
        }
    };

    /**
     * Remove data listener function
     * @public
     * @method
     * @param {string} name Name of the listener to be removed
     * @param {function} fn Callback function to be removed from listeners
     * */
    self.off = function(name, fn) {

        _clients.forEach(function(client) {
            client.off(name, fn);
        });
        if(_clientListeners.has(name)) {
            _clientListeners.get(name).splice(_clientListeners.get(name).indexOf(fn), 1);
        }

    };

    /**
     * Get list of clients of user
     * @public
     * @method
     * */
    self.getClients = function() {
        return _clients;
    };

    /**
     * Get length of clients of user
     * @public
     * @method
     * */
    self.getClientLength = function() {
        return _clients.length;
    };

};


exports = module.exports = User;