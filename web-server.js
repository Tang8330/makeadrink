var express = require('express'),
    path = require('path'),
    mongoose = require('mongoose'),
    exphbs = require('express3-handlebars'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    http = require('http'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    cookieSession = require('cookie-session');


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
    //app.use(logger('dev'));
    app.set('views', __dirname + '/views');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cookieParser());
    app.use(cookieSession({
        secret: 'robinisthebest'
    }));
    app.use(passport.initialize());
    app.use(passport.session());
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
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.auth()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

mongoose.connect('mongodb://localhost/mixdatup');
require('./routes.js')(app);

// Configure passport
http.createServer(app).listen(8080, '0.0.0.0', function() {
    console.log("Express server listening on %s:%d in %s mode", '192.168.0.14', 8080, app.settings.env);
});