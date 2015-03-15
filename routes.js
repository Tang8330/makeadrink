var Item = require('./models/item'),
    Order = require('./models/order');
module.exports = function(app) {

    app.get('/:home', function(req, res) {
        res.render(req.params.home);
    });

    app.get('/item/all', function(req, res) {
        Item.findAll(function(err, result) {
            if (err) {
                res.render('allItems', {
                    message : err
                });
            } else {
                res.render('allItems', {
                    items : result
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
                    item : result
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
    app.post('/order/update/:id', function(req, res) {
        Order.update({
            '_id': req.params.id
        }, req.body, function(err, result) {
            if (err) {
                res.render('order', {
                    message: err
                });
            } else {
                res.render('order', {
                    message: 'Updated'
                });
            }
        });
    });
    app.get('/', function(req, res) {
        res.sendfile('app/index.html');
    });
}
