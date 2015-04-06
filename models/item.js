var mongoose = require('mongoose'),
    async = require('async'),
    Schema = mongoose.Schema;

var Item = new Schema({
    name: String,
    price: Number,
    ingredients: [],
    prep: String,
    glass: String,
    garnish: String,
    category: Object,
    desc: String,
    pictures: [],
    isDeleted: {
        type: Boolean,
        default: false
    },
    owner: String,
    lastModifiedBy: String,
    lastModifiedDate: Date,
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

var tempItem = mongoose.model('Item', Item);

var create = function(request, cb) {
    var instance = new tempItem();
    var keys = Object.keys(request);
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
    tempItem.findOneAndUpdate(conditions, request, function(err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}

var findByUser = function(user, callback) {
    tempItem.find({
        'owner': user
    }, null, {}, function(err, collection) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, collection);
        }
    })
};

var findAll = function(callback) {
    tempItem.find({
            'isDeleted': false
        },
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

var findByID = function(id, callback) {
    tempItem.findById(id, function(err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}

var randomizeLikesDislikes = function(likes, dislikes, callback) {
    tempItem.find({
            $and: [{
                ingredients: {
                    $elemMatch: {
                        $in: likes
                    }
                }
            }, {
                ingredients: {
                    $not: {
                        $elemMatch: {
                            $in: dislikes
                        }
                    }
                }
            }]
        },
        function(err, result) {
            if (err) {
                callback(err, null);
            } else {
                if (result.length === 0 || !result) {
                    callback(null, []);
                } else {
                    var idx = Math.floor((Math.random() * result.length) + 1);
                    callback(null, result[idx - 1]);
                }
            }
        });
};

var randomize = function(likes, dislikes, callback) {
    tempItem.find({
            $and: [{
                ingredients: {
                    $not: {
                        $elemMatch: {
                            $in: dislikes
                        }
                    }
                }
            }]
        },
        function(err, result) {
            if (err) {
                callback(err, null);
            } else {
                if (result.length === 0 || !result) {
                    callback(null, []);
                } else {
                    var idx = Math.floor((Math.random() * result.length) + 1);
                    callback(null, result[idx - 1]);
                }
            }
        });
};
module.exports = mongoose.model('Item', Item);
module.exports.create = create;
module.exports.update = update;
module.exports.findByUser = findByUser;
module.exports.findAll = findAll;
module.exports.count = count;
module.exports.findByID = findByID;
module.exports.randomize = randomize;
module.exports.randomizeLikesDislikes = randomizeLikesDislikes;