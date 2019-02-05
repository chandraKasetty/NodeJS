const localStorage_Keys_Units = "Units";
const metric = "metric";
const imperial = "imperial";
const localstorage_Keys_TimeStamp = "timestamp";

$(function () {
    Initialize();
})

function Initialize() {
    var localStorageUnits = localStorage.getItem(localStorage_Keys_Units);
    SetUnitsAndSaveToLocalStorage(localStorageUnits ? localStorageUnits : metric);
    LoadDataFromLocalStorageOrServer();
}

$(function () {
    $("#imperial, #metric").on("click", function () {
        SetUnitsAndSaveToLocalStorage(this.id);
        LoadDataFromLocalStorageOrServer();
    });
});

function SetUnitsAndSaveToLocalStorage(units) {
    localStorage.Units = units;
    $(((units == metric) ? '#imperial' : '#metric')).removeClass("active")
    $("#" + units).addClass("active");
}

function DefaultUnits() {
    var system = localStorage.getItem(localStorage_Keys_Units);
    if (system != metric && system != imperial) {
        system = window.navigator.language == "en-US" ? imperial : metric;
    }
    SetUnitsAndSaveToLocalStorage(system);
}
function GeoLocation() {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(GetCoordinatesAndLoadWeatherFromService, ShowError);
    }
    else {
        $("#weather").html("Geolocation is not supported by this browser.");
    }
}
function GetCoordinatesAndLoadWeatherFromService(position) {
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    GetWeatherFromService("weather", lat, long);
    GetWeatherFromService("forecast", lat, long);
}
function ShowError(error) {
    var errorMessages = {
        PERMISSION_DENIED: "User denied the request for geolocation.",
        POSITION_UNAVAILABLE: "Location information is unavailable.",
        TIMEOUT: "The request to get user location timed out.",
        UNKNOWN_ERROR: "An unknown error occurred."
    };
    $("#weather").html(errorMessages.UNKNOWN_ERROR);
    for (var msg in errorMessages)
        if (error[msg] === error.code)
            $("#weather").html(errorMessages[msg]);
}
function GetWeatherFromService(type, lat, long) {

    localStorage.timestamp = Math.round(Date.now() / 1000);

    var units = localStorage.getItem(localStorage_Keys_Units);
    var url = `http://localhost:8080/?lat=${lat}&lon=${long}&type=${type}&units=${units}`;

    $.getJSON(url, function (data) {
        localStorage.setItem("cache-" + type + "-" + units, JSON.stringify(data));
        LocalizeAndDisplayData();
    })
        .done(function () { console.log('getJSON request succeeded!'); })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $("#weather").html("Error retrieving current weather data :: \n Message : " + jqXHR.responseJSON.message + "\n ErrorCode :" + jqXHR.responseJSON.cod);
            console.log('getJSON request failed! ' + textStatus);
        })
        .always(function () { console.log('getJSON request ended!'); });
};

function LoadDataFromLocalStorageOrServer() {

    var timeStampLocalStorage = localStorage.getItem(localstorage_Keys_TimeStamp);

    if (!timeStampLocalStorage ||
        (timeStampLocalStorage && Math.round(Date.now() / 1000) - localStorage.getItem(localstorage_Keys_TimeStamp) >= 5)) {
        GeoLocation();
    }
    else {
        LocalizeAndDisplayData();
    }
}
function LocalizeAndDisplayData() {
    if (localStorage.getItem(localStorage_Keys_Units) == imperial) {
        DisplayData(imperial, "F", "mph");
    }
    else {
        DisplayData(metric, "C", "m\/s");
    }
}

function DisplayData(system, temp_units, wind_units) {
    var data, forecast;
    try {
        data = JSON.parse(localStorage.getItem("cache-weather-" + system));
        forecast = JSON.parse(localStorage.getItem("cache-forecast-" + system));
    }
    catch (exception) {
        if (window.console) {
            console.error(exception);
        }
        return;
    }
    if (!data || !forecast) {
        return;
    }

    if (data.cod == "200") {
        document.body.style.background = "url('backgrounds/" + data.weather[0].icon + ".jpg') no-repeat fixed 50% 50%";
        document.body.style.backgroundSize = "cover";
        $("#weather").html('<h2>' + data.name + '</h2><img class="icon" src="icons/' + data.weather[0].icon + '.png"><span id="temp">' + Math.round(data.main.temp) + ' </span><span id="units">&deg;' + temp_units + '</span><p id="description">' + data.weather[0].description + '</p><p><span id="humidity">' + data.main.humidity + '% humidity</span>&nbsp;&nbsp;&nbsp;&nbsp;' + Math.round(data.wind.speed) + wind_units + ' wind</p>');

    } else {
        $("#weather").html("Error retrieving current weather data :: \n Message : " + data.message + "\n ErrorCode :" + data.cod);
    }

    if (forecast.cod == "200") {
        var str = "";
        $.each(forecast.Weather, function (y, x) {

            var minTemp = x.GetMinOf("temp_min");
            var maxTemp = x.GetMaxOf("temp_max");

            str = str + `<div class="day" style="background-image: url(backgrounds/${x[0].icon.replace("n", "d")}.jpg) "><h2 class="Header inline">${x[0].day} </h2><div class="ImageText inline"><image src="${x[0].weather_icon}"></image><p>${x[0].weather_description} </p></div><div class="inline"><p class="forecastMinMax">Min : ${Math.round(minTemp.temp_min)}&deg;${temp_units}</p><p class="forecastMinMax">Max : ${Math.round(maxTemp.temp_max)}&deg;${temp_units}</p></div></div>`;
        });

        $("#forecast").html(str);
    } else {
        $("#forecast").html("Error retrieving forecast weather data :: \n Message : " + data.message + "\n ErrorCode :" + data.cod);

    }

}

Array.prototype.GetMinOf = function (attrib) {
    return this.reduce(function (prev, curr) {
        return prev[attrib] < curr[attrib] ? prev : curr;
    });
}

Array.prototype.GetMaxOf = function (attrib) {
    return this.reduce(function (prev, curr) {
        return prev[attrib] > curr[attrib] ? prev : curr;
    });
}


