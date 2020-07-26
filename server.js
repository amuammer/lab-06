const express = require("express");
require("dotenv").config();

const Location = require("./Models/Location").default;
const Weather = require("./Models/Weather").default;

const app = express();

app.all("*", (req, res, next) => {
  console.log(`${req.method} ${req.url}`);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, HEAD, PUT, PATCH, POST, DELETE"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.get("/", (req, res) => {
  res.status(200).send({ msg: "Hello World"});
});

app.get("/location", (req, res) => {
  const data = require("./data/location");
  const { city } = req.query;
  let locationData = new Location(city, data);
  res.status(200).send(locationData);
});

app.get("/weather", (req, res) => {
  const weatherData = require('./data/weather.json');
  let { city } = req.query;
  const data = [];
  weatherData.data.forEach(item => {
    data.push(new Weather(city, item));
  });
  res.send(data);
})

app.all("*", (req, res) => {
  res.status(500).send({ msg: "Sorry, something went wrong"});
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("The server is running on port", PORT);
});
