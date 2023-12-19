const express = require("express");
const router = express.Router();
const { initializeMiddlewares, ensureAuth } = require('../middleware/ensureAuth');

initializeMiddlewares(router);

//
const weatherController = require("../controllers/weatherController")

//weather rout which return result
router.get("/weather",ensureAuth,weatherController.weather_get);


router.get("/", ensureAuth,(req, res) => {
    res.render("index", { weather: null, error: null, user: req.user , city: null,cities: null});
});

// router.post("/city", ensureAuth,weatherController.create_city)

module.exports = router;