// const axios = require("axios");
//
//
// exports.weather_get = async (req,res) =>{
//     const city = req.query.city;
//     const api = '06c70491b3c169a9083f9587f91c5153';
//
//
//     const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${api}`;
//
//
//     let weather;
//     let error = "Nie ma takiego miasta!";
//     try {
//       const response = await axios.get(url);
//       weather = response.data;
//       error = null;
//     } catch (err) {
//       console.error(err);
//       weather = null;
//     }
//
//     res.render("index", { weather, error, user: req.user });
// }
//
// //create /city route
//
// exports.create_city =(req,res,next)=>{
//     const city = new city({
//         name : req.body.name,
//         mail : req.body.mail
//     })
//     city.save()
//         .then(result => {
//             // res.status(201).json({
//             //     wiadomosc: "utworzenie nowego pociagu",
//             //     info: result
//             // })
//             res.redirect('/');
//         })
//         .catch(error => {
//             res.status(500).json(error)
//         })
// }

const axios = require("axios");
const City = require('../models/city');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

exports.weather_get = async (req, res) => {
    const cityName = req.query.city;
    const api = '06c70491b3c169a9083f9587f91c5153';

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${api}`;

    let weather;
    let error = "Nie ma takiego miasta!";
    try {
        const response = await axios.get(url);
        weather = response.data;
        error = null;
    } catch (err) {
        console.error(err);
        weather = null;
    }

    res.render("index", { weather, error, user: req.user });
}

// exports.create_city = (req, res, next) => {
//     const newCity = new City({
//         name: req.body.city,
//         mail: req.body.mail
//     });
//     console.log(newCity);
//     newCity.save()
//         .then(result => {
//             res.redirect('/');
//         })
//         .catch(error => {
//             res.status(500).json(error);
//         });
// }
exports.create_city = (req, res, next) => {
    console.log(req.body.mail)
    const newCity = new City({
        name: req.query.city, // Access the form data using req.body
        mail: req.query.email // Access the email from the hidden input
    });

    console.log(newCity);
    newCity.save()
        .then(result => {
            res.redirect('/');
        })
        .catch(error => {
            res.status(500).json(error);
        });
}