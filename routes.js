var Item = require('./models/item'),
    Order = require('./models/order'),
    Account = require('./models/account'),
    passport = require('passport'),
    fs = require('fs'),
    path = require('path'),
    Promise = require('promise');

var titles = {
    'register': 'Mix Dat Up | Register',
    'login': 'Mix Dat Up | Login',
    'menu': 'Mix Dat Up | Menu'
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


    app.get('/:home', function(req, res) {
        if (req.params.home === 'home') {
            res.cookie('table_number', randomNumber());
        }
        res.render(req.params.home);
    });

    app.get('/menu', function(req, res) {
        Item.findAll(function(err, result) {
            if (err) {
                res.render('menu', {
                    err: err
                });
            } else {
                res.render('menu', {
                    items: result
                });
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
        conditions.owner = req.user;
        conditions.lastModifiedBy = req.user;
        conditions.lastModifiedDate = new Date();
        Item.create(conditions, function(err, result) {
            if (err) {
                res.render('restaurant/addItem', {
                    message: err
                });
            } else {
                res.render('restaurant/addItem', {
                    message: result
                });
            }
        });
    });
    app.get('/item/id/:req.params.id', function(req, res) {
        Item.findByID(req.params.id, function(err, result) {
            if (err) {
                res.render('customer/item', {
                    message: err
                });
            } else {
                res.render('customer/item', {
                    item: result
                });
            }
        });
    });
    app.post('/order/add', function(req, res) {
        var conditions = req.body;
        conditions.lastModifiedBy = req.user;
        conditions.lastModifiedDate = new Date();
        conditions.owner = req.user;
        Order.create(conditions, function(err, result) {
            if (err) {
                res.render('restaurant/order', {
                    message: err
                });
            } else {
                res.render('restaurant/order', {
                    item: result
                });
            }
        });
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

    app.get('/', function(req, res) {
        res.sendfile('app/index.html');
    });

    app.get('/order/id/:req.params.id', function(req, res) {
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
        conditions.lastModifiedBy = req.user;
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
                    }, conditions, req.user, function(err2, result2) {
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