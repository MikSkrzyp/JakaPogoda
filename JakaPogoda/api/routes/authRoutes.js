const routes = require('express').Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const City = require('../models/city')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const dotenv = require('dotenv')
const flash = require('connect-flash')

const express = require('express');
const { initializeMiddlewares, ensureAuth } = require('../middleware/ensureAuth');
const weatherController = require ("../controllers/weatherController");

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


//ROUTES
//GET index strona rejestracyjna
// routes.get('/register', (req, res) => {
//     res.render('register')
// })

// GET Route for registration form
// GET Route for registration form
routes.get('/register', (req, res) => {
    const errorMessage = req.flash('error_message');
    const successMessage = req.flash('success_message');
    res.render('register', { error: errorMessage, success: successMessage });
});

// Registration Route
routes.post('/register', async (req, res) => {
    try {
        const { username, email, password1, password2 } = req.body;

        // Validation
        if (!email || !username || !password1 || !password2) {
            req.flash('error_message', 'Please fill all the fields');
            return res.redirect('/register');
        }

        if (password1 !== password2) {
            req.flash('error_message', "Passwords don't match");
            return res.redirect('/register');
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            req.flash('error_message', 'User already exists');
            return res.redirect('/register');
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

        req.flash('success_message', 'Registered Successfully. Please log in to continue.');
        return res.redirect('/login');
    } catch (error) {
        req.flash('error_message', 'Something went wrong. Please try again.'); // Generic error message
        return res.redirect('/register');
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
routes.get('/login', (req, res) => {
    res.render('login')
})
routes.post('/login', (req, res, next) => {
    console.log(req.body)
    //definiowanie strategy
    passport.authenticate('local', {
        failureRedirect: '/login',
        
        successRedirect: '/',
        failureFlash: true,
    })(req, res, next);
})



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
