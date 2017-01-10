const Api = require("./Api");

const api = new Api("http://social:85");

const Client = function(socket) {
    const self = this;

    self.info = {
        userId: 0,
        sessionId: null
    };

    self.identify = function(callback) {
        socket.emit("open session", null, function(data) {
            self.info.sessionId = data;
            api.post("/io/io.php", {password: "123456789"}, function(err,res,body) {
                if(body.error===0) {
                    self.info.userId = body.userid;
                    callback.apply(self);
                } else {
                    socket.disconnect();
                }
            }, {
                "Cookie": "PHPSESSID="+data
            });
        });
    };

    self.authenticate = function(callback) {
        api.post("/io/io.php", {password: "123456789"}, function(err,res,body) {
            let profile = {
                id: body.userid,
                fullname: body.fullname,
                followers: body.followers.split(","),
                following: body.following.split(","),
                image: body.image
            };
            callback(profile);
            self.emit("get profile", profile);
        }, {
            "Cookie": "PHPSESSID="+self.info.sessionId
        });
    };

    self.emit = function(...args) {
        socket.emit(...args);
    };

    self.on = function(...args) {
        socket.on(...args);
    };

};

exports = module.exports = Client;