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
//GET index strona rejestracyjna
routes.get('/register', (req, res) => {
    res.render('register')
})

//rejestracja


routes.post('/register', async (req, res) => {
    try {
        const { username, email, password1, password2 } = req.body;

        // walidacja
        if (!email || !username || !password1 || !password2) {
            throw new Error("Please fill all the fields");
        }

        if (password1 !== password2) {
            throw new Error("Passwords don't match");
        }

        // sprawdzenie czy uzytkownik istnieje
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new Error("User already exists");
        }

        // hashowanie hasla
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password1, salt);

        // stworzenie nowego usera
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        // zapisywanie do bazy danych
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
