const express = require("express");

//wyciagam route
const router = express.Router()

//
const weatherController = require("../controllers/weatherController")

//weather rout
router.get("/",weatherController.weather_get);


module.exports = router;