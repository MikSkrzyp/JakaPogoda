const express = require("express");
const axios = require("axios");
const app = express();

// ustawianie ejs
app.set("view engine", "ejs");

// ustawienie folderu publicznego jako foldera z plikami statycznymi
app.use(express.static("public"));

// renderowanie strony glownej z wartosciami domyslnymi
app.get("/", (req, res) => {
  res.render("index", { weather: null, error: null });
});

// robienie /weather routa
app.get("/weather", async (req, res) => {
  
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
});
// ustawianie portu i startowanie servera
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Aplikacja jest na porcie ${port}`);
});