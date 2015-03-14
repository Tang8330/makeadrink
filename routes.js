var Item = require('./models/item');

module.exports = function(app) {

    app.get('/home', function(req, res) {
        res.render('home');
    });
    app.post('/add/item', function(req, res) {
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
    app.get('/', function(req, res) {
        res.sendfile('app/index.html');
    });
}
