const express = require("express");
const axios = require("axios");

//wyciagam route
const router = express.Router()

//weather rout
router.get("/",async (req, res) => {
  
    const city = req.query.city;
    const api = '06c70491b3c169a9083f9587f91c5153';
  
   
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${api}`;
  
    
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
  
    res.render("index", { weather, error });
  })


module.exports = router;