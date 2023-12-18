const routes = require('express').Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const dotenv = require('dotenv')
const flash = require('connect-flash')

const express = require('express');
const { initializeMiddlewares, ensureAuth } = require('../middleware/ensureAuth');

initializeMiddlewares(routes);

//ROUTES
//GET index signup page
routes.get('/register', (req, res) => {
    res.render('register')
})

//signup


routes.post('/register', async (req, res) => {
    try {
        const { username, email, password1, password2 } = req.body;

        // Validation
        if (!email || !username || !password1 || !password2) {
            throw new Error("Please fill all the fields");
        }

        if (password1 !== password2) {
            throw new Error("Passwords don't match");
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new Error("User already exists");
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password1, salt);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        // Save the new user to the database
        await newUser.save();

        req.flash('success_message', 'Registered Successfully. Please log in to continue.');
        res.redirect('/login');
    } catch (error) {
        res.render('register', { err: error.message, email, username });
    }
});

//AUTH STRATEGY
const localStrategy = require('passport-local').Strategy;

passport.use(new localStrategy({
    usernameField: 'email'
}, async (email, password, done) => {
    try {
        // Find user by email
        const user = await User.findOne({ email });

        // If no user exists
        if (!user) {
            return done(null, false, { message: "User Doesn't Exist" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Passwords don't match
            return done(null, false, { message: "Email or Password did not Match" });
        }

        // Passwords match
        return done(null, user);
    } catch (error) {
        // Handle errors
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
// END OF AUTH STRATEGY




//login
routes.get('/login', (req, res) => {
    res.render('login')
})
routes.post('/login', (req, res, next) => {
    console.log(req.body)
    //define startegy
    passport.authenticate('local', {
        failureRedirect: '/login',
        //successRedirect: '/success',
        successRedirect: '/',
        failureFlash: true,
    })(req, res, next);
})


//success
routes.get('/success', ensureAuth, (req, res) => {
    res.render('success', { 'user': req.user })
})

// Logout route
routes.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
            // Handle error if there's any
            console.error(err);
            return next(err);
        }
        req.flash('success_message', "Logout Successful. Login to continue.");
        res.redirect('/login');
    });
});


//Post Messages
routes.post('/addmsg', ensureAuth, (req, res) => {
    User.findOneAndUpdate({
            email: req.user.email
        },
        {
            $push: {
                messages: req.body['msg']
            }
        }, (err, success) => {
            if (err) throw err;
            if (success) {
                console.log("Added ...")
            }
        });
    req.flash('success_message', "Message Added Successfully")
    res.redirect('/success')

})
module.exports = routes
