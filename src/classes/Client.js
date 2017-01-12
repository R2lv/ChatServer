const Api = require("./Api");

const api = new Api("http://social:85");

/**
 * Creates a client class, actually it's a wrapper of socket, identifies and authenticates it
 * @name Client
 * @param {Socket} socket
 * @class
 * */
const Client = function(socket) {
    const self = this;

    self.info = {
        userId: 0,
        sessionId: null
    };

    self.identify = function(callback) {

        socket.emit("_open_session_", function(data) {
            self.identification(data, function (info) {
                self.info = info;
                callback.apply(self);
            });
        });
    };

    self.authenticate = function(callback) {
        self.authentication(self.info, function(profile) {
            callback(profile);
            self.emit("_get_profile_", profile);
        });
    };

    self.identification = function(data, callback) {
        api.post("/io/io.php", {password: "123456789"}, function(err,res,body) {
            if(body.error===0) {
                callback({
                    userId: body.userid,
                    sessionId: data
                });
            } else {
                socket.disconnect();
            }
        }, {
            "Cookie": "PHPSESSID="+data
        });
    };

    self.authentication = function(info, callback) {
        api.post("/io/io.php", {password: "123456789"}, function(err,res,body) {
            if(body.error) {
                self.disconnect();
                return;
            }
            let profile = {
                id: body.userid,
                fullname: body.fullname,
                followers: body.followers === null ? [] : body.followers.split(","),
                following: body.following === null ? [] : body.following.split(","),
                image: body.image
            };
            callback(profile);
        }, {
            "Cookie": "PHPSESSID="+info.sessionId
        });
    };

    self.emit = function(...args) {
        socket.emit(...args);
    };

    self.on = function(...args) {
        socket.on(...args);
    };

    self.disconnect = socket.disconnect;

};

exports = module.exports = Client;