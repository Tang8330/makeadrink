var express = require('express'),
    path = require('path'),
    mongoose = require('mongoose'),
    exphbs = require('express3-handlebars'),
    http = require('http');

var app = express();

var errorHandler = require('express-error-handler'),
    handler = errorHandler({
        static: {
            '404': '404.html',
        }
    });
app.engine('html', exphbs({
    defaultLayout: 'main.html'
}));
app.set('view engine', 'html');

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('192829ssajmkkol'));
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(errorHandler.httpError(404));
    app.use(handler);
});
app.configure('development', function() {
    app.use(express.errorHandler());
});
app.configure('production', function() {
    app.use(express.errorHandler());
});

mongoose.connect('mongodb://localhost/mixdatup');
require('./routes.js')(app);

// Configure passport
http.createServer(app).listen(8080, '0.0.0.0', function() {
    console.log("Express server listening on %s:%d in %s mode", '192.168.0.14', 8080, app.settings.env);
});
