const express = require("express");
const router = express.Router();
const { initializeMiddlewares, ensureAuth } = require('../middleware/ensureAuth');

initializeMiddlewares(router);

//
const weatherController = require("../controllers/weatherController")

//weather rout which return result
router.get("/weather",ensureAuth,weatherController.weather_get);



router.get("/", ensureAuth,weatherController.weather_get);


module.exports = router;