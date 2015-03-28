var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose'),
    Schema = mongoose.Schema,
    async = require('async');

var Account = new Schema({
    name: String,
    dateAdded: {
        type: Date,
        default: Date.now
    }
});
Account.plugin(passportLocalMongoose);
var tempAccount = mongoose.model('Account', Account);

var findByUser = function(username, callback) {
    tempAccount.find({
        'username': username,
    }, function(err, user) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, user);
        }
    });
};

var create = function(request, cb) {
    var instance = new tempAccount(),
        keys = Object.keys(request);
    async.forEach(keys, function(el, callback) {
        instance[el] = request[el];
        callback();
    }, function() {
        instance.save(function(err, result) {
            cb(err, result);
        });
    });
}
var update = function(conditions, request, callback) {
    tempAccount.findOneAndUpdate(conditions, request, function(err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}

var findAll = function(callback) {
    tempAccount.find({},
        null, {},
        function(err, collection) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, collection);
            }
        }
    );
};

var count = function(callback) {
    tempAccount.count({}, function(err, len) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, len);
        }
    });
};

var findByID = function(id, callback) {
    tempAccount.findById(id, function(err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}

var auth = function() {
    var self = this;
    return function(username, password, cb) {
        self.findByUser(username, function(err, user) {
            if (err) {
                return cb(err);
            } else if (user.length === 0) {
                return cb(null, false);
            } else {
                return user.authenticate(password, cb);
            }
        });
    }
}
module.exports = mongoose.model('Account', Account);
module.exports.findByUser = findByUser;
module.exports.create = create;
module.exports.update = update;
module.exports.findAll = findAll;
module.exports.count = count;
module.exports.auth = auth;