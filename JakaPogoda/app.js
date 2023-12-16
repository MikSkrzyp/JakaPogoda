const express = require("express");
const app = express();


// ustawianie ejs
app.set("view engine", "ejs");

// ustawienie folderu publicznego jako foldera z plikami statycznymi
app.use(express.static("public"));

// renderowanie strony glownej z wartosciami domyslnymi

  const weatherRoutes = require("./api/routes/weathers")
  app.use("/weather",weatherRoutes)

  app.get("/", (req, res) => {
    res.render("index", { weather: null, error: null });
  });

// ustawianie portu i startowanie servera
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Aplikacja jest na porcie ${port}`);
});