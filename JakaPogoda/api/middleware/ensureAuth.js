const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

const initializeMiddlewares = (routes) => {
    routes.use(cookieParser('secret'));
    routes.use(
        session({
            secret: 'secret',
            maxAge: 3600000,
            resave: true,
            saveUninitialized: false,
        })
    );
    routes.use(passport.initialize());
    routes.use(passport.session());

    routes.use(flash());
    routes.use(function (req, res, next) {
        res.locals.success_message = req.flash('success_message');
        res.locals.error_message = req.flash('error_message');
        res.locals.error = req.flash('error');
        next();
    });

    return routes;
};

const ensureAuth = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.set(
            'Cache-Control',
            'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0'
        );
        next();
    } else {
        req.flash('error_message', 'Please Login to continue!');
        res.redirect('/login');
    }
};

module.exports = { initializeMiddlewares, ensureAuth };
