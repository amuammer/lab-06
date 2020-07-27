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

app.get("/location", (req, res, next) => {
  const data = require("./data/location");
  const { city } = req.query;
  try {
    if (!city) throw new Error();
    else if (!isNaN(city)) throw new Error();
    let locationData = new Location(city, data);
    res.status(200).send(locationData);
  } catch (e) {
    next(e);
  }
});

app.get("/weather", (req, res, next) => {
  const weatherData = require('./data/weather.json');
  let { search_query } = req.query;
  if (!search_query) return next(new Error());
  else if (!isNaN(search_query)) return next(new Error());

  const result = weatherData.data.map(item => {
    return new Weather(search_query, item);
  });

  res.send(result);
})

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Sorry, page not found !"});
})

app.use((err, req, res, next) => { // eslint-disable-line
  res.status(500).send({ msg: "Sorry, something went wrong !"});
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("The server is running on port", PORT);
});
