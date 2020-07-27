const express = require("express");
require("dotenv").config();

const axios = require("axios");

const Location = require("./Models/Location").default;
const Weather = require("./Models/Weather").default;
const Trails = require("./Models/Trails").default;

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
  const { city } = req.query;
  try {
    if (!city) throw new Error();
    else if (!isNaN(city)) throw new Error();
    getData(city, (locationData) => {
      res.status(200).send(locationData);
    });
  } catch (e) {
    next(e);
  }
});

function getData(city, callback){
  let LOCATIONAPIKEY = process.env.LOCATIONAPIKEY;
  let url = `https://eu1.locationiq.com/v1/search.php?key=${LOCATIONAPIKEY}&q=${city}&format=json`;
  axios.get(url).then(response => {
    callback(new Location(city, response.data));
  });
}

app.get("/weather", handelWeather);

function handelWeather(req, res) {
  let city = req.query.search_query;

  getWeather(city, (returnedData) => {
    res.status(200).send(returnedData);
  });
}

function getWeather(city, callback) {
  Weather.all = [];

  let WEATHER_API_KEY = process.env.WEATHER_API_KEY;
  let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${WEATHER_API_KEY}`;

  axios.get(url).then(data => {
    const returnedData = data.data.data.map(item => {
      return new Weather(city, item);
    });
    // after map => return returnedData
    callback(returnedData);
  });
}

app.get("/trails", handelTrails);

function handelTrails(req, res) {
  let latitude = req.query.latitude;
  let longitude = req.query.longitude;

  getTrails(latitude, longitude).then(returnedData => {
    res.send(returnedData);
  }).catch((err) => {
    console.log(err.message);
  });
}

function getTrails(lat, lon) {
  let HIKING_API_KEY = process.env.HIKING_API_KEY;
  let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=1000&key=${HIKING_API_KEY}`;

  return axios.get(url).then(data => {
    return data.data.trails.map(data => {
      return new Trails(data);
    });
  });
}


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
