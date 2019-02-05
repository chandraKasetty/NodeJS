var request = require('request');
var helper = require("./Helper")
var url = require('url');
var apiKey = 'b27afb5e50deecba87c5673bbeae4814';

module.exports = {

    RequestOpenWeatherMapAPI: function (url, type, res) {
        RequestOpenWeatherMapAPI(url, type, res)
    },
    CallForecastAPI: function (res) {
        CallForecastAPI(res);
    },
    CallWeatherAPI: function (res) {
        CallWeatherAPI(res);
    }
}

function RequestOpenWeatherMapAPI(urlString, res) {

    var qs = url.parse(urlString, true).query;
    var city = qs.city;
    var lat = qs.lat;
    var lon = qs.lon;
    var type = qs.type;
    var units = qs.units;
    var openweathermapUrl = `http://api.openweathermap.org/data/2.5/${type}?lat=${lat}&lon=${lon}&units=${units}&APPID=${apiKey}`

    if (type.toLowerCase() == "Weather".toLowerCase()) {
        RequestOpenWeatherMap(openweathermapUrl, CallWeatherAPI(res));

    } else {
        RequestOpenWeatherMap(openweathermapUrl, CallForecastAPI(res));
    }
}

function RequestOpenWeatherMap(openweathermapUrl, callbackFunction) {

    request(openweathermapUrl, function (error, response, body) {

        if (!error) {
            res = body;
        }
        else {
            res = error;
        }

        callbackFunction(res);
    });
}

function CallForecastAPI(res) {

    return function (weatherResponse) {

        let weather = JSON.parse(weatherResponse);
        if (weather.cod == "200") {
            let city = weather.city.name;
            let forecast = weather.list;
            jsonObj = [];
            for (i in forecast) {
                jsonObj.push({
                    day_num: new Date(forecast[i].dt_txt).getDay(),
                    day: helper.GetDayFromDate(forecast[i].dt_txt),
                    date: forecast[i].dt_txt,
                    temp: forecast[i].main.temp,
                    temp_min: forecast[i].main.temp_min,
                    temp_max: forecast[i].main.temp_max,
                    weather_icon: `http://openweathermap.org/img/w/${forecast[i].weather[0].icon}.png`,
                    icon: forecast[i].weather[0].icon,
                    weather_description: forecast[i].weather[0].description
                });
            }
            ;
            let xyz = helper.GroupBy(jsonObj, 'day_num');
            var obj = {
                "cod":"200",
                "City": city,
                "Weather": xyz
            };
            res.write(JSON.stringify(obj));
        } else {
            res.write(weatherResponse)
        }
        res.end();
    };
}

function CallWeatherAPI(res) {
    return function (weatherResponse) {
        res.write(weatherResponse);
        res.end();
    };
}