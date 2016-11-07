var port = process.argv.slice(2)[0];
var id = process.argv.slice(2)[1]
var delay = 1000;

var express = require('express');  
var app = express();
var server = require('http').Server(app);  
var request = require('request');

/*server.listen(port, function() {  
    console.log('Servidor corriendo en http://localhost:' + port);
});*/

setInterval(post_Request,delay);

function post_Request(){
    request({
        url: 'http://localhost:3000',
        method: 'POST',
        json: {"id" : id,
                "datetime" : getDateTime(),
                "data": { 
                    "sensor1": random(0,20,5), 
                    "sensor2": random(0,20,5)}
            }
        }, function(error, response, body){
            if(body != null){        
                delay = body.delay;
                console.log(delay)
            }
    });
}

function random(low, high, step) {
    return Math.floor(Math.random() * (high - low + 1) + low) * step;
}

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + ":" + hour + ":" + min + ":" + sec;
}