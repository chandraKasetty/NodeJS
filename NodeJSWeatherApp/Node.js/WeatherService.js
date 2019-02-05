var openweathermapAPI = require('./OpenweathermapAPI') 
var request = require('request');
var http = require('http'); 

http.createServer(function (req, res) {

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })

    if (req.url == "/favicon.ico") return;
    
    openweathermapAPI.RequestOpenWeatherMapAPI(req.url,res);

}).listen(8080);

