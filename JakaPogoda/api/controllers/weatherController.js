

const axios = require("axios");
const City = require('../models/city');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('express').Router()

const app = express();

// Middleware to parse incoming request bodies
routes.use(bodyParser.urlencoded({ extended: true }));
routes.use(bodyParser.json());



exports.weather_get = async (req, res) => {
    let cityName;
    if(req.query.city === undefined){
        cityName = "Warszawa";
    }
    else{
        cityName = req.query.city;
    }
    //const cityName = req.query.city;
    let weather = "";
    const user = req.user;
    let error = "Nie ma takiego miasta!";

    const api = "Insert here api key";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${api}`;

    try {
        const response = await axios.get(url);
        weather = response.data;
        error = null;
    } catch (err) {
        console.error(err);
        weather= null;
    }

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
            error: error,
            weather: weather,
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
    const api = 'Insert here api key';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${api}`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (err) {
        console.error(err);
        return null;
    }
}



exports.create_city = (req, res, next) => {


    const { city,email } = req.body;

    console.log(city,email);

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
