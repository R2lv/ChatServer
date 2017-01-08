const request = require("request");
// var qs = request("querystring");

const Api = function(url) {
    const self = this;

    self.get = function(endpoint, data, callback, headers) {
        request.get(url+endpoint,{
            json:true,
            headers: headers
        },callback);
    };

    self.post = function(endpoint,data,callback,headers) {
        request.post(url+endpoint,{
            form: data,
            json: true,
            headers: headers
        },callback);
    }
};

exports = module.exports = Api;