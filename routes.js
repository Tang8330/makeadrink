var Item = require('./models/item');
module.exports = function(app) {

    app.get('/home', function(req, res) {
        res.render('home');
    });


    /**
     * These 2 functions need update on the view render path
    **/
    app.post('/item/add', function(req, res) {
        Item.create(req.body, function(err, result) {
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
    app.get('/', function(req, res) {
        res.sendfile('app/index.html');
    });
}
