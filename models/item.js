var mongoose = require('mongoose'),
    async = require('async'),
    Schema = mongoose.Schema;

var Item = new Schema({
    name: String,
    price: Number,
    ingredients: Object,
    prep: String,
    glass: String,
    garnish: String,
    category: Object,
    desc: String,
    pictures: [],
    isDeleted: Boolean,
    dateAdded: {
        type: Date,
        default: Date.now
    }

});

var tempItem = mongoose.model('Item', Item);

var create = function(request, cb) {
    var instance = new tempItem();
    var keys = Object.keys(request);
    async.ForEach(key, function(el, callback) {
        instance[key] = el;
        callback();
    }, function() {
        instance.save(function(err, result) {
            cb(err, result);
        });
    });
}
var update = function(conditions, request, callback) {
    tempItem.findOneAndUpdate(conditions, request, function(err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}

var findAll = function(callback) {
    tempItem.find({},
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
    tempItem.count({}, function(err, len) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, len);
        }
    });
};

module.exports = mongoose.model('Item', Item);
module.exports.create = create;
module.exports.update = update;
module.exports.findAll = findAll;
module.exports.count = count;
