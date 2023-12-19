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
const User = require ("../models/user");
// const router = require("../routes/weathers")
const routes = require('express').Router()

const app = express();

// Middleware to parse incoming request bodies
routes.use(bodyParser.urlencoded({ extended: true }));
routes.use(bodyParser.json());

// exports.weather_get = async (req, res) => {
//     const cityName = req.query.city;
//     //function which return json with weather for city
//     const weather = await weatherJson(cityName);
//     const user = req.user
//
// const Cities = await City.find({email: user.email});
//
// let CitiesData = {}
//
//     Cities.forEach(city => {
//         CitiesData[city.name] = weatherJson(city.name)
//     })
//
//     console.log(CitiesData)
//
//     res.render("index", { weather, user: req.user, city: cityName,cities: Cities, citiesData: CitiesData});
// }
//
// async function weatherJson(cityName) {
//     const api = '06c70491b3c169a9083f9587f91c5153';
//
//     const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${api}`;
//
//     let weather;
//     let error = "Nie ma takiego miasta!";
//     try {
//         const response = await axios.get(url);
//         weather = response.data;
//         error = null;
//     } catch (err) {
//         console.error(err);
//         weather = null;
//     }
//     return weather;
// }

exports.weather_get = async (req, res) => {
    const cityName = req.query.city;
    const weather = await weatherJson(cityName);
    const user = req.user;

    const Cities = await City.find({ email: user.email });

    const citiesWeatherPromises = Cities.map(city => weatherJson(city.name));

    try {
        const citiesWeatherData = await Promise.all(citiesWeatherPromises);

        const CitiesData = {};
        Cities.forEach((city, index) => {
            CitiesData[city.name] = citiesWeatherData[index];
        });

        console.log(CitiesData);

        res.render("index", {
            weather,
            user: req.user,
            city: cityName,
            cities: Cities,
            citiesData: CitiesData
        });
    } catch (error) {
        console.error(error);
        // Handle error here
        res.status(500).send('An error occurred');
    }
};

async function weatherJson(cityName) {
    const api = '06c70491b3c169a9083f9587f91c5153';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${api}`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (err) {
        console.error(err);
        return null;
    }
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

    const { city,email } = req.body;
    console.log(city,email);
    // const newCity = new City({
    //     name: req.body, // Access the form data using req.body
    //     email: req.query.email // Access the email from the hidden input
    // });
    const newCity = new City({
        city,
        email,
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