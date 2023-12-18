const routes = require('express').Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const dotenv = require('dotenv')
const flash = require('connect-flash')


//Conect to db
// dotenv.config()
// mongoose.connect(process.env.DB_CONNECT, {
//     useNewUrlParser: true, useUnifiedTopology: true,
// }).then(() => console.log("DATABASE CONNECTED")).catch((err) => {
//     console.log("Error while connecting with database ", err)
// })


//middlewares
routes.use(cookieParser('secret'))
routes.use(session({
    secret: 'secret',
    maxAge: 3600000,
    resave: true,
    saveUninitialized: false,
}))

//set passport
routes.use(passport.initialize())
routes.use(passport.session())

//Connect Flash after cookie and session
routes.use(flash());
routes.use(function (req, res, next) {
    res.locals.success_message = req.flash('success_message')
    res.locals.error_message = req.flash('error_message')
    res.locals.error = req.flash('error')
    next()

})

//Ensure Auth
const ensureAuth = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    } else {
        req.flash('error_message', "Please Login to continue !");
        res.redirect('/login');
    }
}

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
        successRedirect: '/success',
        failureFlash: true,
    })(req, res, next);
})


//success
routes.get('/success', ensureAuth, (req, res) => {
    res.render('success', { 'user': req.user })
})

//logout
routes.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_message', "Logout Successfully login to continue")
    res.redirect('/login')

})

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