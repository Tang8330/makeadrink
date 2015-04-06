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

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/account/login');
    }
};

function randomNumber() {
    'use strict';
    return Math.floor(Math.random() * 90000) + 10000;
}
module.exports = function(app) {
    'use strict';
    app.post('/account/login',
        passport.authenticate('local', {
            successRedirect: '/home',
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
        if (req.user.role === 'owner') {
            res.render('customer/home', {
                owner: true
            });
        } else {
            res.render('customer/home', {
                customer: true
            });
        }
    });

    app.get('/menu/restaurant', function(req, res) {
        var user = req.user || '';
        Item.findByUser(user, function(err, result) {
            if (err) {
                res.render('customer/menu', {
                    err: err
                });
            } else {
                if (req.user.role === 'owner') {
                    res.render('customer/menu', {
                        items: result,
                        owner: true
                    });
                } else {
                    res.render('customer/menu', {
                        items: result,
                        customer: true
                    });
                }
            }
        });
    });

    app.get('/menu', ensureAuthenticated, function(req, res) {
        Item.findAll(function(err, result) {
            if (err) {
                res.render('customer/menu', {
                    err: err
                });
            } else {
                if (req.user.role === 'owner') {
                    res.render('customer/menu', {
                        items: result,
                        owner: true
                    });
                } else {
                    res.render('customer/menu', {
                        items: result,
                        customer: true
                    });
                }
            }
        });
    });

    app.get('/item/view/:id', ensureAuthenticated, function(req, res) {
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

                    if (req.user.role === 'owner') {
                        res.render('customer/viewItem', {
                            owner: true,
                            err: err
                        });
                    } else {
                        res.render('customer/viewItem', {
                            customer: true,
                            err: err
                        });
                    }
                } else {

                    if (req.user.role === 'owner') {
                        res.render('customer/viewItem', {
                            owner: true,
                            item: result
                        });
                    } else {
                        res.render('customer/viewItem', {
                            customer: true,
                            item: result
                        });
                    }
                }
            });
        }, function error(e) {
            if (req.user.role === 'owner') {
                res.render('customer/viewItem', {
                    owner: true,
                    err: err
                });
            } else {
                res.render('customer/viewItem', {
                    customer: true
                });
            }
        });
    });
    app.get('/item/picture/:id', ensureAuthenticated, function(req, res) {
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
    app.get('/item/edit/:id', ensureAuthenticated, function(req, res) {
        Item.findById(req.params.id, function(err, result) {
            if (err) {

                if (req.user.role === 'owner') {
                    res.render('restaurant/editItem', {
                        owner: true,
                        err: err
                    });
                } else {
                    res.render('restaurant/editItem', {
                        customer: true,
                        err: err
                    });
                }
            } else {
                if (req.user.role === 'owner') {
                    res.render('restaurant/editItem', {
                        owner: true,
                        item: result
                    });
                } else {
                    res.render('restaurant/editItem', {
                        customer: true,
                        item: result
                    });
                }
            }
        });
    });
    app.get('/item/delete/:id', ensureAuthenticated, function(req, res) {
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
    app.post('/item/edit/:id', ensureAuthenticated, function(req, res) {
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

                        if (req.user.role === 'owner') {
                            res.render('restaurant/editItem', {
                                owner: true,
                                err: error
                            });
                        } else {
                            res.render('restaurant/editItem', {
                                customer: true,
                                err: error
                            });
                        }
                    } else {
                        if (req.user.role === 'owner') {
                            res.render('restaurant/editItem', {
                                owner: true,
                                item: result
                            });
                        } else {
                            res.render('restaurant/editItem', {
                                customer: true,
                                item: result
                            });
                        }
                    }
                });
            });
        }, function error(e) {
            if (req.user.role === 'owner') {
                res.render('restaurant/editItem', {
                    owner: true,
                    err: e
                });
            } else {
                res.render('restaurant/editItem', {
                    customer: true,
                    err: e
                });
            }
        });
    });

    app.get('/item/edit', ensureAuthenticated, function(req, res) {
        Item.findAll(function(err, result) {
            if (err) {
                if (req.user.role === 'owner') {
                    res.render('restaurant/editItem', {
                        owner: true,
                        err: err
                    });
                } else {
                    res.render('restaurant/editItem', {
                        customer: true,
                        err: err
                    });
                }
            } else {
                if (req.user.role === 'owner') {
                    res.render('restaurant/editItem', {
                        owner: true,
                        items: result
                    });
                } else {
                    res.render('restaurant/editItem', {
                        customer: true,
                        items: result
                    });
                }
            }
        });
    });

    app.get('/item/add', ensureAuthenticated, function(req, res) {
        if (req.user.role === 'owner') {
            res.render('restaurant/addItem', {
                owner: true
            });
        } else {
            res.render('restaurant/addItem', {
                customer: true
            });
        }
    });
    /**
     * These 2 functions need update on the view render path
     **/
    app.post('/item/add', ensureAuthenticated, function(req, res) {
        var conditions = req.body;
        if (req.files.filezilla) {
            conditions.pictures = true;
        }
        conditions.owner = req.user;
        conditions.lastModifiedBy = req.user;
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
                                        if (req.user.role === 'owner') {
                                            res.render('restaurant/addItem', {
                                                owner: true,
                                                err: error
                                            });
                                        } else {
                                            res.render('restaurant/addItem', {
                                                customer: true,
                                                err: error
                                            });
                                        }
                                    } else {
                                        if (req.user.role === 'owner') {
                                            res.render('restaurant/addItem', {
                                                owner: true,
                                                item: result
                                            });
                                        } else {
                                            res.render('restaurant/addItem', {
                                                customer: true,
                                                item: result
                                            });
                                        }
                                    }
                                });
                            }

                        });

                    });
                } else {

                    if (req.user.role === 'owner') {
                        res.render('restaurant/addItem', {
                            owner: true,
                            item: result,
                            msg: 'Successfully added this item'
                        });
                    } else {
                        res.render('restaurant/addItem', {
                            customer: true,
                            item: result,
                            msg: 'Successfully added this item'
                        });
                    }
                }

            },
            function error(e) {
                if (req.user.role === 'owner') {
                    res.render('restaurant/addItem', {
                        owner: true,
                        err: e
                    });
                } else {
                    res.render('restaurant/addItem', {
                        customer: true,
                        err: e
                    });
                }
            });
    });

    app.get('/item/id/:req.params.id', ensureAuthenticated, function(req, res) {
        Item.findById(req.params.id, function(err, result) {
            if (err) {
                if (req.user.role === 'owner') {
                    res.render('customer/item', {
                        owner: true,
                        err: err
                    });
                } else {
                    res.render('customer/item', {
                        customer: true,
                        err: err
                    });
                }
            } else {
                if (req.user.role === 'owner') {
                    res.render('customer/item', {
                        owner: true,
                        item: result
                    });
                } else {
                    res.render('customer/item', {
                        customer: true,
                        item: result
                    });
                }
            }
        });
    });


    app.get('/order/bill', ensureAuthenticated, function(req, res) {
        var tableNumber = req.cookies.table_number || 0,
            total = 0;
        Order.findByTable(tableNumber, function(err, result) {
            if (err) {
                if (req.user.role === 'owner') {
                    res.render('customer/bill', {
                        owner: true,
                        err: err
                    });
                } else {
                    res.render('customer/bill', {
                        customer: true,
                        err: err
                    });
                }
            } else {
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

                    if (req.user.role === 'owner') {
                        res.render('customer/bill', {
                            owner: true,
                            total: total,
                            item: result
                        });
                    } else {
                        res.render('customer/home', {
                            customer: true,
                            total: total,
                            item: result
                        });
                    }
                });
            }
        });
    });
    app.post('/order/add', ensureAuthenticated, function(req, res) {
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
        conditions.lastModifiedBy = req.user;
        conditions.lastModifiedDate = new Date();
        conditions.owner = req.user;
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
            res.send(500, e);
        });

    });
    app.post('/customer/randomizer', ensureAuthenticated, function(req, res) {
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
                    if (req.user.role === 'owner') {
                        res.render('randomize', {
                            err: err,
                            owner: true
                        });
                    } else {
                        res.render('randomize', {
                            err: err,
                            customer: true
                        });
                    }
                } else {
                    if (req.user.role === 'owner') {
                        res.render('randomize', {
                            result: result,
                            owner: true
                        });
                    } else {
                        res.render('randomize', {
                            result: result,
                            customer: true
                        });
                    }
                }
            });
        } else {
            Item.randomize(likes, dislikes, function(err, result) {
                if (err) {
                    if (req.user.role === 'owner') {
                        res.render('randomize', {
                            err: err,
                            owner: true
                        });
                    } else {
                        res.render('randomize', {
                            err: err,
                            customer: true
                        });
                    }
                } else {
                    if (req.user.role === 'owner') {
                        res.render('randomize', {
                            result: result,
                            owner: true
                        });
                    } else {
                        res.render('randomize', {
                            result: result,
                            customer: true
                        });
                    }
                }
            });
        }
    });
    app.get('/order/stats', ensureAuthenticated, function(req, res) {
        Item.findAll(function(err, collection) {
            if (err) {

                if (req.user.role === 'owner') {
                    res.render('restaurant/data', {
                        owner: true,
                        err: err
                    });
                } else {
                    res.render('restaurant/data', {
                        customer: true,
                        err: err
                    });
                }
            } else {
                if (req.user.role === 'owner') {
                    res.render('restaurant/data', {
                        owner: true,
                        items: collection
                    });
                } else {
                    res.render('restaurant/data', {
                        customer: true,
                        items: collection
                    });
                }
            }
        });
    });
    app.get('/customer/randomizer', ensureAuthenticated, function(req, res) {
        if (req.user.role === 'owner') {
            res.render('randomize', {
                owner: true
            });
        } else {
            res.render('randomize', {
                customer: true
            });
        }
    });

    app.get('/contact', function(req, res) {
        if (req.user) {
            if (req.user.role === 'owner') {
                res.render('contact', {
                    owner: true
                });
            } else {
                res.render('contact', {
                    customer: true
                });
            }
        } else {

            res.render('contact');
        }


    });

    app.get('/order/all', ensureAuthenticated, function(req, res) {
        Order.findAll(function(err, result) {
            if (err) {
                if (req.user.role === 'owner') {
                    res.render('restaurant/allOrders', {
                        owner: true,
                        err: err
                    });
                } else {
                    res.render('restaurant/allOrders', {
                        customer: true,
                        err: err
                    });
                }
            } else {
                if (req.user.role === 'owner') {
                    res.render('restaurant/allOrders', {
                        owner: true,
                        orders: result
                    });
                } else {
                    res.render('restaurant/allOrders', {
                        customer: true,
                        orders: result
                    });
                }
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
    app.get('/order/pending', ensureAuthenticated, function(req, res) {
        Order.find({
            'statusCode': 1
        }, null, {}, function(err, collection) {
            if (err) {
                res.render('restaurant/pendingOrders', {
                    err: err
                });
            } else {
                if (req.user.role === 'owner') {
                    res.render('restaurant/pendingOrders', {
                        owner: true,
                        orders: collection
                    });
                } else {
                    res.render('restaurant/pendingOrders', {
                        orders: collection,
                        customer: true
                    });
                }
            }
        });
    });
    app.get('/order/id/:id', ensureAuthenticated, function(req, res) {
        Order.findById(req.params.id, function(err, result) {
            if (err) {
                if (req.user.role === 'owner') {
                    res.render('restaurant/order', {
                        owner: true,
                        err: err
                    });
                } else {
                    res.render('restaurant/order', {
                        customer: true,
                        err: err
                    });
                }
            } else {
                if (req.user.role === 'owner') {
                    res.render('restaurant/order', {
                        owner: true,
                        order: result
                    });
                } else {
                    res.render('restaurant/order', {
                        customer: true,
                        order: result
                    });
                }
            }
        });
    });
    app.post('/order/edit/:id', ensureAuthenticated, function(req, res) {
        var tableNumber = req.cookies.table_number,
            conditions = req.body;
        conditions.lastModifiedBy = req.user;
        conditions.lastModifiedDate = new Date();
        if (tableNumber === undefined) {
            tableNumber = randomNumber();
            res.cookie('table_number', tableNumber);
        }
        Order.findById(req.params.id, function(err, result) {
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