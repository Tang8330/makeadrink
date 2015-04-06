var Item = require('./models/item'),
    Order = require('./models/order'),
    Account = require('./models/account'),
    passport = require('passport'),
    mkdirp = require('mkdirp'),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),
    validator = require('./validator'),
    _ = require('underscore'),
    Promise = require('promise');

var titles = {
    'register': 'Mix Dat Up | Register',
    'login': 'Mix Dat Up | Login',
    'menu': 'Mix Dat Up | Menu',
    'editItem': 'Mix Dat Up | Edit Item'
};

function randomNumber() {
    'use strict';
    return Math.floor(Math.random() * 90000) + 10000;
}
module.exports = function(app) {
    'use strict';
    app.post('/account/login',
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/account/login'
        }));
    app.get('/account/login', function(req, res) {
        res.render('login', {
            'title': titles.login
        });
    });
    app.get('/account/register', function(req, res) {
        res.render('register', {
            'title': titles.register
        });
    });
    app.post('/account/register', function(req, res) {
        if (req.body.username && req.body.password) {
            var p = new Promise(function(resolve, reject) {
                Account.findByUser(req.body.username, function(err, result) {
                    if (err) {
                        reject(err);
                    } else if (result.length === 0) {
                        resolve(false); //doesn't exist
                    } else {
                        resolve(true);
                    }
                });

            });
            p.then(function success(data) {
                if (data === false) {
                    Account.register(new Account({
                        username: req.body.username
                    }), req.body.password, function(err) {
                        if (err) {
                            res.render('register', {
                                'err': err,
                                'title': titles.register
                            });
                        } else {
                            res.render('register', {
                                'message': 'Registered!',
                                'title': titles.register
                            });
                        }
                    });
                } else {
                    res.render('register', {
                        'err': 'Account already exists',
                        'title': titles.register
                    });
                }
            }, function error(e) {
                res.render('register', {
                    'err': e,
                    'title': titles.register
                });
            });
        } else {
            res.render('register', {
                'err': 'No username or password',
                'title': titles.register
            });
        }

    });

    app.get('/home', function(req, res) {
        res.cookie('table_number', randomNumber());
        res.render('customer/home');
    });

    app.get('/menu/restaurant', function(req, res) {
        var user = req.user || '';
        Item.findByUser(user, function(err, result) {
            if (err) {
                res.render('customer/menu', {
                    err: err
                });
            } else {
                res.render('customer/menu', {
                    items: result
                });
            }
        });
    });

    app.get('/menu', function(req, res) {
        Item.findAll(function(err, result) {
            if (err) {
                res.render('customer/menu', {
                    err: err
                });
            } else {
                res.render('customer/menu', {
                    items: result
                });
            }
        });
    });

    app.get('/item/view/:id', function(req, res) {
        var p = new Promise(function(resolve, reject) {
            Item.increaseView(req.params.id, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        p.then(function success(data) {
            Item.findById(req.params.id, function(err, result) {
                if (err) {
                    res.render('customer/viewItem', {
                        message: err
                    });
                } else {
                    res.render('customer/viewItem', {
                        item: result
                    });
                }
            });
        }, function error(e) {
            res.render('customer/viewItem', {
                message: err
            });
        });
    });
    app.get('/item/picture/:id', function(req, res) {
        var itemPath = path.join(__dirname, 'public', 'assets', req.params.id);
        fs.readdir(itemPath, function(err, items) {
            if (items && items.length > 0) {
                var item = path.join(itemPath, items[0]);
                res.sendfile(item);
            } else {
                res.send(500);
            }
        });
    });
    app.get('/item/edit/:id', function(req, res) {
        Item.findByID(req.params.id, function(err, result) {
            if (err) {
                res.render('restaurant/editItem', {
                    message: err
                });
            } else {
                res.render('restaurant/editItem', {
                    item: result
                });
            }
        });
    });
    app.get('/item/delete/:id', function(req, res) {
        Item.update({
            _id: req.params.id
        }, {
            'isDeleted': true
        }, function(err, result) {
            if (err) {
                res.send(500);
            } else {
                res.send(200);
            }
        });
    });
    app.post('/item/edit/:id', function(req, res) {
        var conditions = req.body;
        conditions.lastModifiedBy = req.user;
        conditions.lastModifiedDate = new Date();
        var p = new Promise(function(resolve, reject) {
            Item.update({
                _id: req.params.id
            }, conditions, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        p.then(function success(result) {
            fs.readFile(req.files.file.path, function(err, data) {
                var folder = path.join('assets', result._id, req.files.file.originalFilename),
                    pathNew = path.join(__dirname, 'public', folder);
                fs.writeFile(pathNew, data, function(error) {
                    if (error) {
                        res.render('restaurant/editItem', {
                            message: error
                        });
                    } else {
                        res.render('restaurant/editItem', {
                            item: result
                        });
                    }
                });
            });
        }, function error(e) {
            res.render('restaurant/editItem', {
                message: e
            });
        });
    });

    app.get('/item/edit', function(req, res) {
        Item.findAll(function(err, result) {
            if (err) {
                res.render('restaurant/editItem', {
                    message: err
                });
            } else {
                res.render('restaurant/editItem', {
                    items: result
                });
            }
        });
    });

    app.get('/item/add', function(req, res) {
        res.render('restaurant/addItem');
    });
    /**
     * These 2 functions need update on the view render path
     **/
    app.post('/item/add', function(req, res) {
        var conditions = req.body;
        if (req.files.filezilla) {
            conditions.pictures = true;
        }
        //conditions.owner = req.user;
        //conditions.lastModifiedBy = req.user;
        conditions.lastModifiedDate = new Date();
        var p = new Promise(function(resolve, reject) {
            Item.create(conditions, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        p.then(function success(result) {
                if (req.files.filezilla) {
                    fs.readFile(req.files.filezilla.path, function(err, data) {
                        var folder = '/assets/' + result._id,
                            pathOld = path.join(__dirname, 'public', folder),
                            pathNew = pathOld + '/' + req.files.filezilla.originalname;
                        mkdirp(pathOld, function(err) {
                            if (err) {
                                res.render('restaurant/addItem', {
                                    message: error
                                });
                            } else {
                                fs.writeFile(pathNew, data, function(error) {
                                    if (error) {
                                        res.render('restaurant/addItem', {
                                            message: error
                                        });
                                    } else {
                                        res.render('restaurant/addItem', {
                                            item: result
                                        });
                                    }
                                });
                            }

                        });

                    });
                } else {
                    res.render('restaurant/addItem', {
                        item: result,
                        msg: 'Successfully added this item'
                    });
                }

            },
            function error(e) {
                res.render('restaurant/addItem', {
                    message: e
                });
            });
    });

    app.get('/item/id/:req.params.id', function(req, res) {
        Item.findByID(req.params.id, function(err, result) {
            if (err) {
                res.render('customer/item', {
                    err: err
                });
            } else {
                res.render('customer/item', {
                    item: result
                });
            }
        });
    });


    app.get('/order/bill', function(req, res) {
        var tableNumber = req.cookies.table_number || 0,
            total = 0;
        Order.findByTable(tableNumber, function(err, result) {
            if (err) {
                res.render('customer/bill', {
                    err: err
                });
            } else {
                //results
                var items = result[0] || {
                    items: ''
                }
                async.forEach(items.items, function(el, callback) {
                    if (el.id) {
                        Item.findById(el.id, function(error, itemz) {
                            if (err) {
                                callback();
                            } else {
                                total = total + itemz.price;
                                callback();
                            }
                        });
                    } else {
                        callback();
                    }

                }, function() {
                    res.render('customer/bill', {
                        item: result,
                        total: total
                    });

                });

            }
        });
    });
    app.post('/order/add', function(req, res) {
        var tableNumber = req.cookies.table_number,
            conditions = {};
        conditions['items'] = req.cookies.cart;
        if (tableNumber === undefined) {
            tableNumber = randomNumber();
            res.cookie('table_number', tableNumber);
        }

        if (!conditions || conditions.length === 0) {
            res.send(500, 'Empty, no data sent');
        }
        //conditions.lastModifiedBy = req.user;
        conditions.lastModifiedDate = new Date();
        //conditions.owner = req.user;
        conditions.tableNumber = tableNumber;

        var p = new Promise(function(resolve, reject) {
            Order.findByTable(tableNumber, function(err, result) {
                if (err) {
                    reject(err);
                } else if (result.length === 0 || !result) {
                    resolve(false);
                } else {
                    resolve(result);
                }
            });
        });
        p.then(function success(data) {
            if (data === false) {
                if (conditions.items) {
                    conditions.items = JSON.parse(conditions.items);
                }
                Order.create(conditions, function(err, result) {
                    if (err) {
                        res.send(500, e);
                    } else {
                        res.send(200, result);
                    }
                });
            } else {
                var params = {};
                var host = [];
                host.push.apply(host, JSON.parse(conditions.items));
                if (data[0].items) {
                    host.push.apply(host, data[0].items);
                }
                conditions.items = host;
                params.tableNumber = tableNumber;
                params.statusCode = 1; //ORDERSTATUS_SENT, export later
                Order.update(params, conditions, function(err, result) {
                    if (err) {
                        res.send(500, e);
                    } else {
                        res.send(200, result);
                    }
                });
            }
        }, function error(e) {
            res.render('restaurant/order', {
                err: e
            });
        });

    });
    app.post('/customer/randomizer', function(req, res) {
        var likes = [],
            dislikes = [];
        if (req.body.like && !(req.body.like instanceof Array)) {
            likes.push(req.body.like);
        } else if (req.body.like instanceof Array) {
            likes = req.body.like;
        }
        if (req.body.dislikes && !(req.body.dislikes instanceof Array)) {
            dislikes.push(req.body.dislikes);
        } else if (req.body.dislikes instanceof Array) {
            dislikes = req.body.dislikes;
        }
        if (likes.length > 0) {
            Item.randomize(likes, dislikes, function(err, result) {
                if (err) {
                    res.render('randomize', {
                        err: err
                    });
                } else {
                    res.render('randomize', {
                        result: result
                    });
                }
            });
        } else {
            Item.randomize(likes, dislikes, function(err, result) {
                if (err) {
                    res.render('randomize', {
                        err: err
                    });
                } else {
                    res.render('randomize', {
                        result: result
                    });
                }
            });
        }
    });
    app.get('/order/stats', function(req, res) {
        Item.findAll(function(err, collection) {
            if (err) {
                res.render('restaurant/data', {
                    err: err
                });
            } else {
                res.render('restaurant/data', {
                    items: collection
                });
            }
        });
    });
    app.get('/customer/randomizer', function(req, res) {
        res.render('randomize');
    });

    app.get('/contact', function(req, res) {
        res.render('contact');
    });

    app.get('/order/all', function(req, res) {
        Order.findAll(function(err, result) {
            if (err) {
                res.render('restaurant/allOrders', {
                    message: err
                });
            } else {
                res.render('restaurant/allOrders', {
                    orders: result
                });
            }
        });
    });

    app.get('/500', function(req, res) {
        res.render('500', {
            error: 'you know better'
        });
    });
    app.get('/', function(req, res) {
        res.sendfile('app/index.html');
    });
    app.get('/order/pending', function(req, res) {
        Order.find({
            'statusCode': 1
        }, null, {}, function(err, collection) {
            if (err) {
                res.render('restaurant/pendingOrders', {
                    err: err
                });
            } else {
                res.render('restaurant/pendingOrders', {
                    orders: collection
                });
            }
        });
    });
    app.get('/order/id/:id', function(req, res) {
        Order.findByID(req.params.id, function(err, result) {
            if (err) {
                res.render('restaurant/order', {
                    message: err
                });
            } else {
                res.render('restaurant/order', {
                    order: result
                });
            }
        });
    });
    app.post('/order/edit/:id', function(req, res) {
        var tableNumber = req.cookies.table_number,
            conditions = req.body;
        //conditions.lastModifiedBy = req.user;
        conditions.lastModifiedDate = new Date();
        if (tableNumber === undefined) {
            tableNumber = randomNumber();
            res.cookie('table_number', tableNumber);
        }
        Order.findByID(req.params.id, function(err, result) {
            if (err) {
                res.send(500, err);
            } else {
                if (!result || result.length === 0) {
                    conditions.owner = req.user;
                    Order.create(conditions, function(err1, result1) {
                        if (err1) {
                            res.send(500, err1);
                        } else {
                            res.send(200, result1);
                        }
                    });
                } else {
                    Order.update({
                        '_id': req.params.id
                    }, conditions, function(err2, result2) {
                        if (err2) {
                            res.send(500, err2);
                        } else {
                            res.send(200, result2);
                        }
                    });
                }
            }
        });
    });

};