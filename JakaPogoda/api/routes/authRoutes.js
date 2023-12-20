const routes = require('express').Router()
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const City = require('../models/city')
const passport = require('passport')


//const express = require('express');
const { initializeMiddlewares, ensureAuth } = require('../middleware/ensureAuth');
//const weatherController = require ("../controllers/weatherController");

initializeMiddlewares(routes);


routes.post("/city", ensureAuth,(req, res) => {
const newCity = new City({
        name: req.body.city,
        email: req.body.email
    });
    console.log(newCity);
    newCity.save()
        .then(result => {
            res.redirect('/');
        })
        .catch(error => {
            res.status(500).json(error);
        });

});

routes.post("/city/:id", ensureAuth,(req, res) => {
    const id = req.params.id;
    console.log(id);

    City.findByIdAndDelete(id)
        .then(result => {
            res.redirect('/');
        })
        .catch(error => {
            console.log("error");
            res.status(500).json(error);
        });
});




// GET Route for registration form

// GET Registration Page
routes.get('/register', (req, res) => {
    const { error, success } = req.query;
    res.render('register', { error, success });
});

// POST Registration Route
routes.post('/register', async (req, res) => {
    try {
        const { username, email, password1, password2 } = req.body;

        // Validation
        if (!email || !username || !password1 || !password2) {
            return res.redirect('/register?error=Please%20fill%20all%20the%20fields');
        }

        if (password1 !== password2) {
            return res.redirect('/register?error=Passwords%20don\'t%20match');
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.redirect('/register?error=User%20already%20exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password1, salt);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        // Save to the database
        await newUser.save();

        return res.redirect('/login?success=Registered%20Successfully.%20Please%20log%20in%20to%20continue.');
    } catch (error) {
        return res.redirect('/register?error=Something%20went%20wrong.%20Please%20try%20again.');
    }
});


//AUTH STRATEGY
const localStrategy = require('passport-local').Strategy;

passport.use(new localStrategy({
    usernameField: 'email'
}, async (email, password, done) => {
    try {
        // znajdz uzytkownika po mailu
        const user = await User.findOne({ email });

        // jezeli user nie istnieje
        if (!user) {
            return done(null, false, { message: "User Doesn't Exist" });
        }

        // porownaj hasla
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // hasla nie pasuja
            return done(null, false, { message: "Email or Password did not Match" });
        }

        // hasla pasuja
        return done(null, user);
    } catch (error) {
        // errory
        return done(null, false, { message: "Some Error Occurred" });
    }
}));

passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
    try {
        const user = await User.findById(id);
        cb(null, user);
    } catch (err) {
        cb(err, null);
    }
});
// koniec AUTH STRATEGY




//login
// GET Login Page
routes.get('/login', (req, res) => {
    const { error } = req.query;
    res.render('login', { error });
});

// POST Login Route
routes.post('/login', (req, res, next) => {
    // Define strategy
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.redirect('/login?error=Something%20went%20wrong.%20Please%20try%20again.');
        }
        if (!user) {
            return res.redirect('/login?error=Invalid%20username%20or%20password.');
        }
        req.logIn(user, (loginErr) => {
            if (loginErr) {
                return res.redirect('/login?error=Login%20failed.%20Please%20try%20again.');
            }
            return res.redirect('/');
        });
    })(req, res, next);
});




// wylogowywanie rout
routes.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
            // obsluga errorow
            console.error(err);
            return next(err);
        }
        req.flash('success_message', "Logout Successful. Login to continue.");
        res.redirect('/login');
    });
});


module.exports = routes
