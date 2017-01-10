const User = function() {
    const self = this;

    // Private Variables
    const _clients = [];
    const _listeners = {};

    // Public variables
    self.profile = {};

    self.active = null;
    self.authenticated = false;

    const _triggerEvent = function(event, ...args) {
        if(_listeners.hasOwnProperty(event)) {
            for(let k of _listeners[event]) {
                k.call(...args);
            }
        }
    };

    const _addClientListeners = function(client) {
        client.on("disconnect", function() {
            self.removeClient(client);
        });
        client.on("_message_", function(data) {
            if(typeof data == "object") {
                _triggerEvent("message", self, data, client);
            }
        });
    };

    // Public Functions
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

    self.addListener = function(type, func) {
        if(_listeners.hasOwnProperty(type)) {
            _listeners[type].push(func);
        } else {
            _listeners[type] = [func];
        }
    };

    self.removeClient = function(client) {
        _clients.splice(_clients.indexOf(client),1);

        _triggerEvent("client disconnected", self, client);

        if(_clients.length===0) {
            self.active = false;
            _triggerEvent("offline", self);
        }
    };

    self.emitToAllClients = function(name, message) {
        if(!self.authenticated) return;
        _clients.forEach(function(client) {
            client.emit(name, message);
        });
    };

    self.disconnect = function() {
        for(const key in _clients) {
            _clients[key].disconnect();
        }
    };

    self.isFollowing = function(id) {
        return self.authenticated && self.profile.following.indexOf(id) != -1;
    };

    self.hasFollower = function(id) {
        return self.authenticated && self.profile.followers.indexOf(id) != -1;
    };

    self.sendMessage = function(message) {
        self.emit("_message_", message);
    };

    self.getClients = function() {
        return _clients;
    };

    self.getClientLength = function() {
        return _clients.length;
    };

};


exports = module.exports = User;