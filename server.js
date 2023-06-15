const express = require("express");
const path = require("path");
const nodeCache = require("node-cache");
var bodyParser = require("body-parser");

const myCache = new nodeCache({
    stdTTL: 60,
    checkperiod: 120,
});
const axios = require("axios");
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("express"));

app.use("/home", function (req, res, next) {
    res.sendFile(path.join(__dirname, "index.html"));
});

// url post weather
app.post("/api/weather", async (req, res) => {
    console.log(req.body);
    console.log(req.body.location);

    // check for location in cache
    let weatherData = myCache.get(req.body.location);
    if (weatherData) {
        console.log("Found in cache");
        res.status(200).send(weatherData);
    } else {
        console.log("Not found in cache");
        // hit weather api
        // call https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key} using axios
        const lat = "33.44";
        const lon = "-94.04";

        console.log(lat, lon);
        try {
            axios
                .get(
                    `https://api.openweathermap.org/data/2.5/weather?lat=33.44&lon=-94.04&appid=02a8c416aedesbc9f6a2d134887b8a08c84`
                )
                .then((response) => {
                    console.log(response);
                    weatherData = {
                        temperature: response.data.main.temp,
                        humidity: response.data.main.humidity,
                        windSpeed: response.data.wind.speed,
                        condition: response.data.weather[0].main,
                    };
                    // store in cache
                    myCache.set(req.body.location, weatherData);
                    res.status(200).send(weatherData);
                });
        } catch (error) {
            console.log(error);
            return res.status(500).send("Error");
        }
    }
});

// port listening
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
