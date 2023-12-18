const express = require("express");

//wyciagam route
const router = express.Router()

//
const weatherController = require("../controllers/weatherController")

//weather rout which return result
router.get("/weather",weatherController.weather_get);


router.get("/", (req, res) => {
    res.render("index", { weather: null, error: null });
});

module.exports = router;