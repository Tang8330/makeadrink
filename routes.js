var Item = require('./models/item'),
    Order = require('./models/order'),
    Account = require('./models/account');
module.exports = function(app) {
    function randomNumber() {
        return Math.floor(Math.random() * 90000) + 10000;
    }

    app.get('/account/register', function(req, res) {
        if (req.body.username && req.body.password) {
            Account.register(new Account({
                username: req.body.username
            }), req.body.password, function(err, account) {
                if (err) {
                    res.render('register', message: err);
                } else {
                    res.render('register', message: 'Registered!');
                }
            });
        } else {
            res.render('register', message: 'No username or password');
        }

    });

    app.get('/:home', function(req, res) {
        if (req.params.home === 'home') {
            res.cookie('table_number', randomNumber());
        }
        res.render(req.params.home);
    });

    app.get('/item/all', function(req, res) {
        Item.findAll(function(err, result) {
            if (err) {
                res.render('allItems', {
                    message: err
                });
            } else {
                res.render('allItems', {
                    items: result
                });
            }
        });
    });

    app.get('/item/edit/:id', function(req, res) {
        Item.findByID(req.params.id, function(err, result) {
            if (err) {
                res.render('editItem', {
                    message: err
                });
            } else {
                res.render('editItem', {
                    item: result
                });
            }
        });
    });

    app.post('/item/edit/:id', function(req, res) {
        Item.update({
            _id: req.params.id
        }, req.body, function(err, result) {
            if (err) {
                res.render('editItem', {
                    message: err
                });
            } else {
                res.render('editItem', {
                    item: result
                });
            }
        });
    });

    app.get('/item/edit', function(req, res) {
        Item.findAll(function(err, result) {
            if (err) {
                res.render('editItems', {
                    message: err
                });
            } else {
                res.render('editItems', {
                    items: result
                });
            }
        });
    });
    /**
     * These 2 functions need update on the view render path
     **/
    app.post('/item/add', function(req, res) {
        Item.create(req.body, function(err, result) {
            if (err) {
                res.render('addItem', {
                    message: err
                });
            } else {
                res.render('addItem', {
                    message: result
                });
            }
        });
    });
    app.post('/item/update/:id', function(req, res) {
        Item.update({
            '_id': req.params.id
        }, req.body, function(err, result) {
            if (err) {
                res.render('item', {
                    message: err
                });
            } else {
                res.render('item', {
                    item: result
                })
            }
        });
    });
    app.get('/item/id/:req.params.id', function(req, res) {
        Item.findByID(req.params.id, function(err, result) {
            if (err) {
                res.render('item', {
                    message: err
                });
            } else {
                res.render('item', {
                    item: result
                });
            }
        });
    });
    app.post('/order/add', function(req, res) {
        Order.create(req.body, function(err, result) {
            if (err) {
                res.render('order', {
                    message: err
                });
            } else {
                res.render('order', {
                    item: result
                });
            }
        });
    });
    app.get('/', function(req, res) {
        res.sendfile('app/index.html');
    });

    app.post('/order/update', function(req, res) {
        var tableNumber = req.cookies.table_number;
        if (table_number === undefined) {
            tableNumber = randomNumber();
            res.cookie('table_number', tableNumber);
        }
        Order.findByID(req.params.id, function(err, result) {
            if (err) {
                res.send(500, err);
            } else {
                if (!result || result.length === 0) {
                    Order.create(req.body, function(err1, result1) {
                        if (err1) {
                            res.send(500, err1);
                        } else {
                            res.send(200, result1);
                        }
                    });
                } else {
                    Order.update({
                        '_id': req.params.id
                    }, req.body, function(err2, result2) {
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

}