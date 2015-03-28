var express = require('express'),
    path = require('path'),
    mongoose = require('mongoose'),
    exphbs = require('express3-handlebars'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    http = require('http'),
    Account = require('./models/account');

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

passport.use(new LocalStrategy(function(username, password, done) {
    Account.findByUser({
        username: username
    }, function(err, user) {
        if (err) {
            return done(err);
        } else if (!user) {
            return done(null, false, {
                message: 'Incorrect Username'
            });
        } else if (!user.validPassword(password)) {
            return done(null, false, {
                message: 'Incorrect Password'
            });
        } else {
            return done(null, user);
        }
    });
}));
passport.serializeUser(function(user, done) {
    done(null, user._id);
});
passport.deserializeUser(function(id, done) {
    Account.findById(id, function(err, user) {
        done(err, user);
    });
});

mongoose.connect('mongodb://localhost/mixdatup');
require('./routes.js')(app);

// Configure passport
http.createServer(app).listen(8080, '0.0.0.0', function() {
    console.log("Express server listening on %s:%d in %s mode", '192.168.0.14', 8080, app.settings.env);
});