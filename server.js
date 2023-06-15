const express = require('express');
const path = require('path');
const nodeCache = require('node-cache');
const myCache = new nodeCache({
  stdTTL: 60,
  checkperiod: 120
});
const axios = require('axios');
const app = express();
const port = 3000;
app.use(express.json());
app.use(express.static("express"));

app.use('/home', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'index.html'));
}
);

// url post weather
app.post('/api/weather', async (req, res) => {
    console.log(req.body);
    console.log(req.body.location);

    // check for location in cache
    let response = myCache.get(req.body.location);
    if (response) {
      console.log("Found in cache");
    }else {
      console.log("Not found in cache");
      // hit weather api
      // call https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key} using axios
      const lat = '33.44';
      const lon = '-94.04';
      
      console.log(lat, lon)
      try {
        const weatherData = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=02a8c416a1ebc9f6a2d134887b8a08c84`);
      }
      catch (error) {
        console.log(error);
        return res.status(500).send("Error");
      }
      console.log(weatherData);
      response = {
        temperature: weatherData.data.current.temp,
        humidity: weatherData.data.current.humidity,
        windSpeed: weatherData.data.current.wind_speed,
        condition: weatherData.data.current.weather[0].main,
      }
      // store in cache
      myCache.set(req.body.location, response);
    }
    
    res.status(200).send(response);
});

// port listening
app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
});
