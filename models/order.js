var mongoose = require('mongoose'),
    async = require('async'),
    Schema = mongoose.Schema;

var ORDERSTATUS_INPROGRESS = 0,
    ORDERSTATUS_SENT = 1,
    ORDERSTATUS_DELIVERED = 2,
    ORDERSTATUS_PAID = 3,
    ORDERSTATUS_DEFERRED = 4;

var Order = new Schema({
    name: String,
    party: String,
    items: [],
    isDeleted: Boolean,
    statusCode: Number,
    dateAdded: {
        type: Date,
        default: Date.now
    }

});

var tempOrder = mongoose.model('Order', Order);

var create = function(request, cb) {
    var instance = new tempOrder();
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
    tempOrder.findOneAndUpdate(conditions, request, function(err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}

var findAll = function(callback) {
    tempOrder.find({},
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
    tempOrder.count({}, function(err, len) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, len);
        }
    });
};

module.exports = mongoose.model('Order', Order);
module.exports.create = create;
module.exports.update = update;
module.exports.findAll = findAll;
module.exports.count = count;
