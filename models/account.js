var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose'),
    async = require('async'),
    Schema = mongoose.Schema;

var Account = new Schema({
    username: String,
    name: String,
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

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

module.exports = mongoose.model('Account', Account);
module.exports.findByUser = findByUser;
module.exports.create = create;
module.exports.update = update;
module.exports.findAll = findAll;
module.exports.count = count;